import { NextPage } from 'next';
import { Session, unstable_getServerSession } from 'next-auth';
import { signIn, signOut, useSession } from 'next-auth/react';
import Head from 'next/head';
import { useState } from 'react';
import Container from '../../components/container';
import GenericForm, { FormProps } from '../../components/generic-form';
import { withSession } from '../../lib/with-session';
import { authOptions } from '../api/auth/[...nextauth]';

const AccountPage: NextPage = ({ session }: { session: Session }) => {
  const fields = [
    {
      type: 'text',
      name: 'name',
      required: true,
      label: 'Name',
      autocomplete: 'false',
      value: session.user?.name,
    },
    {
      type: 'email',
      name: 'email',
      required: true,
      label: 'Email',
      autocomplete: 'true',
      value: session.user?.email,
    },
  ];

  const renderForm = ({ register, errors, isSubmitting }: FormProps) => {
    return (
      <>
        {fields.map((field, index) => {
          return (
            <div className="form-control" key={index}>
              <label
                htmlFor={field.name}
                className="input-group input-group-md"
              >
                <span>{field.label}</span>
                <input
                  type={field.type}
                  value={field.value}
                  autoComplete={field.autocomplete}
                  {...register(field.name, { required: field.required })}
                  disabled={true}
                  className="input input-bordered input-md"
                />
              </label>
              <div className="error">{errors[field.name]?.message}</div>
            </div>
          );
        })}

        <button className="btn btn-primary" disabled={true}>
          {isSubmitting ? '' : 'Submit'}
        </button>
      </>
    );
  };

  return (
    <>
      <Head>
        <title>Account</title>
      </Head>
      <Container>
        <div className="flex flex-col md:flex-row justify-center">
          <div className="hero min-h-[50vh] bg-base-200">
            <div className="hero-content flex-col md:flex-row-reverse">
              <div className="text-center md:text-left">
                <h1 className="text-5xl font-bold">Account Info</h1>
              </div>
              <div className="card flex-shrink-0 max-w-sm shadow-2xl bg-base-100">
                <div className="card-body">
                  <GenericForm
                    url="/api/account"
                    renderForm={renderForm}
                    preload={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
};

export const getServerSideProps = async (ctx) => await withSession(ctx);

export default AccountPage;
