import { NextPage } from 'next';
import Image from 'next/image';
import GenericForm, { FormProps } from '../../components/generic-form';


const LoginPage: NextPage = () => {
  const fields = [
    {type: 'email', name: 'email', required: true, label: 'Email', autoComplete: 'email'},
    {type: 'password', name: 'password', required: true, label: 'Password', autoComplete: 'password'},
  ];
  
  const renderForm = ({register, errors, isSubmitting}: FormProps) => {
    return (
      <>
        {fields.map((field, index) => {
          return <div key={index} className="mb-3 w-full">
            <label htmlFor={field.name} className="pr-2">{field.label}</label>
            <input type={field.type} autoComplete={field.autoComplete}
              className="input input-bordered w-full max-w-xs"
              {...register(field.name, {required: field.required})} />
            <div className="error">{errors[field.name]?.message}</div>
          </div>
        })}
        
        <button disabled={isSubmitting} className="btn btn-xs sm:btn-sm md:btn-md">Sign In</button>
      </>
    )
  }
  
  return (
    <section className="h-screen">
      <div className="px-6 py-12 h-full">
        <div className="flex flex-col-reverse md:flex-row justify-center items-center flex-wrap h-full g-6">
          <div className="md:w-1/2 md:mb-0">
            <div className="image-container">
              <Image
                src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                className="image"
                layout='fill'
                alt="Phone image"
              />
            </div>
          </div>
          <div className="md:w-5/12 ">
            <GenericForm url="/api/auth/sign-in" renderForm={renderForm} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage