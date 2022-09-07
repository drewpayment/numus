import { Employee, User } from '@prisma/client';
import { NextPage } from 'next';
import { Session } from 'next-auth';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import Container from '../../components/container';
import { serializeDate } from '../../lib/date.extensions';
import { Paginator } from '../../lib/models/paginator.model';
import userService from '../../lib/services/user.service';
import { withSession } from '../../lib/with-session';
import { request, gql } from 'graphql-request';
import fetch from '../../graphql/fetch';
import Modal from '../../components/modal';
import GenericForm, { FormProps } from '../../components/generic-form';

interface props {
  session: Session;
  me: User;
  agents: (User & {employee: Employee})[];
  page: number;
  take: number;
}

const queryize = (clientId: number, page: number, take: number = 10, trashed: boolean = false) => {
  const skip = (page - 1) * take;
  const deletedAtArgs = trashed ? 'isNot' : 'is';
  return {
    query: gql`
    {
      findManyClientsOfUsers(where: {clientId:{equals:${clientId}},AND: {user:{${deletedAtArgs}:{deleted_at:{equals:null}}}}}, orderBy: {user: {name:asc}}, skip:${skip}, take:${take}) {
        user{
          uid,
          id,
          name,
          email,
          selectedClientId,
          created_at,
          updated_at,
          deleted_at,
          employee{
            id,
            name,
            email,
            phone_no,
            address,
            address_2,
            city,
            state,
            postal_code
          }
        }
      }
    }`
  }
}

const AgentsPage: NextPage = ({ session, me, page: pageProps, take }: props) => {
  const [page, setPage] = useState(pageProps);
  const [showInactive, setShowInactive] = useState(false);
  const qry = queryize(me.selectedClientId, page, take, showInactive);
  const getData = async (...args) => await fetch(qry) as Promise<{findManyClientsOfUsers: { user: (User & {employee:Employee}) }[]}>
  
  // get data
  const {data, error} = useSWR(qry, getData);
  
  if (!data) return (<>
    <Container>
      <div className="flex flex-row justify-center items-center">
        <div className="min-h-[400px]">
          <h2>Loading...</h2>
          <progress className="progress w-56"></progress>
        </div>
      </div>
    </Container>
  </>)
  if (error) return <><h1>ERROR!</h1></>
  
  const formatPhone = (phone: string) => {
    if (!phone) return '';
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`
  }
  
  // write method to call get users api endpoint 
  // need to update page during button click and keep track, and then update the 
  // buttons on the pagination so that they update properly 
  if (error) return <><h1>ERROR</h1></>
  
  const getFields = (agent: User & {employee: Employee}) => {
    return [
      {
        type: 'text', 
        name: 'name',
        required: true,
        label: 'Name',
        autocomplete: 'false',
        disabled: false,
        value: agent.name,
      },
      {
        type: 'email',
        name: 'email', 
        required: true,
        label: 'Email',
        autocomplete: 'autocomplete',
        disabled: false,
        value: agent.email,
      },
      {
        type: 'phone',
        name: 'phone',
        required: false,
        label: 'Phone',
        autocomplete: 'false',
        disabled: false,
        value: agent.employee.phone_no != null ? formatPhone(agent.employee.phone_no) : null,
      },
      {
        type: 'text',
        name: 'address',
        required: true,
        label: 'Street',
        autocomplete: 'autocomplete',
        disabled: false,
        value: agent.employee.address,
      },
      {
        type: 'text',
        name: 'address_2',
        required: false,
        label: 'Apt/Unit/No',
        autocomplete: 'autocomplete',
        disabled: false,
        value: agent.employee.address_2,
      },
      {
        type: 'text',
        name: 'city',
        required: true,
        label: 'City',
        autocomplete: 'autocomplete',
        disabled: false,
        value: agent.employee.city,
      },
      {
        type: 'text',
        name: 'state',
        required: true,
        label: 'State',
        autocomplete: 'autocomplete',
        disabled: false,
        value: agent.employee.state,
      },
      {
        type: 'text',
        name: 'zip',
        required: true,
        label: 'Postal Code',
        autocomplete: 'autocomplete',
        disabled: false,
        value: agent.employee.postal_code,
      },
    ]
  }
  const renderModalFrm = (agent: User & {employee: Employee}, index: number) => {
    const fields = getFields(agent);
    const fn = ({register, errors, isSubmitting}: FormProps) => {
      return (
        <>
          <h2 className="mb-3 text-3xl">{agent?.name}</h2>
          {fields.map((field, idx) => {
            return (
              <div className="form-control" key={agent.uid + '_' + idx}>
                <label htmlFor={field.name} className="input-group input-group-md">
                  <span>{field.label}</span>
                  <input type={field.type}
                    defaultValue={field.value || undefined}
                    autoComplete={field.autocomplete}
                    {...register(field.name, { required: field.required })}
                    disabled={field.disabled}
                    className="input input-bordered input-md w-full"
                  />
                </label>
                <div className="error">{errors[field.name]?.message}</div>
              </div>
            )
          })}
          
          <div className="modal-action">
            <label htmlFor={`${agent?.uid}`} className="btn">Close</label>
            
            <button className="btn btn-primary" disabled={isSubmitting}>Save</button>
          </div>
        </>
      )
    }
    
    return fn;
  }
  
  return (
    <>
      <Head>
        <title>Agents</title>
      </Head>
      <Container>
        <div className={showInactive ? `navbar bg-primary text-primary-content` : `navbar text-primary-content`}>
          <div className="flex-1">
            <div className="form-control">
              <label className="label cursor-pointer ml-1"> 
                <input type="checkbox" checked={showInactive} className="checkbox mr-2" onChange={() => setShowInactive(!showInactive)} />
                <span className="label-text">{showInactive ? 'Show Active' : 'Show Inactive'}</span>
              </label>
            </div>
          </div>
          {showInactive ? 
          <div className="flex-none md:pr-4">
            <h1>INACTIVE AGENTS</h1>
          </div> : <></>}
        </div>
        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>
                  <label>
                    <input type="checkbox" className="checkbox" />
                  </label>
                </th>
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {data.findManyClientsOfUsers.map((agent, i) => {
                
                return (
                  <tr key={i}>
                    <td>
                      <label>
                        <input type="checkbox" className="checkbox" />
                      </label>
                    </td>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar">
                          <div className="mask mask-squircle w-12 h-12">
                            <Image
                              src={'https://via.placeholder.com/56'}
                              alt="Avatar Tailwind CSS Component"
                              width="56px"
                              height="56px"
                            ></Image>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{agent?.user?.name}</div>
                          <div className="text-sm opacity-50">
                            {agent?.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>{formatPhone(agent?.user?.employee?.phone_no)}</td>

                    <td className="flex">
                      <div className="flex-1">
                        {agent?.user?.employee?.address}
                      </div>
                      <div className="flex-none">
                        <label htmlFor={`${agent?.user?.uid}`} className="btn modal-button">Open</label>
                        <Modal id={agent?.user?.uid}>
                          {/* <div className="flex flex-col md:flex-row"> */}
                            <GenericForm
                              url={`/api/agents/${agent?.user?.id}`}
                              method="PUT"
                              renderForm={renderModalFrm(agent.user, i)}
                              preload={false}
                            />
                          {/* </div> */}
                          
                        </Modal>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-row justify-center">
          <div className="btn-group grid grid-cols-2 max-w-xs">
            <button className="btn btn-outline" onClick={() => setPage(page - 1)} disabled={(page - 1) < 1}>Previous</button>
            <button className="btn btn-outline" onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </Container>
    </>
  );
};

export const getServerSideProps = async (ctx) => {
  let page = ctx.query.page || 1;
  if (page < 1 || !isNaN(page)) page = 1;
  const take = 10;
  
  let res = await withSession(ctx);
  const me = await userService.getUser('email', res.props.session.user.email);

  // const { data: agents, page: currentPage, take } = await userService.getAgents(me.uid, me.selectedClientId, page, 10);

  res.props = {
    ...res.props,
    me: {...me,
      created_at: serializeDate(me.created_at),
      deleted_at: serializeDate(me.deleted_at),
      updated_at: serializeDate(me.updated_at),
    } as unknown as User,
    page,
    take,
  };

  return res;
};

export default AgentsPage;
