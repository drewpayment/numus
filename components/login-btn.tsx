import { useSession, signIn, signOut } from "next-auth/react"

const LoginButton = () => {
  const { data: session } = useSession()
  if (session) {
    return (
      <button className="btn" onClick={() => signOut()}>Logout</button>
    )
  }
  return <button className="btn" onClick={() => signIn()}>Get Started</button>
}

export default LoginButton