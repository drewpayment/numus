import { getProviders, signIn } from 'next-auth/react';
import Image from 'next/image';


const LoginPage = ({ providers }) => {
  return(
    <>
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
            <div className="md:w-5/12">
              {Object.values(providers).map((provider: any) => (
                <div key={provider.name}>
                  <button onClick={() => signIn(provider.id, { callbackUrl: '/' })} className="btn btn-primary">
                    Sign in with {provider.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export const getServerSideProps = async (context) => {  
  const providers = await getProviders();
  return { props: { providers, }, } 
}

export default LoginPage