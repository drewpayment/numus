import { useSession, signIn, signOut } from "next-auth/react"
import Link from 'next/link'

const LoginButton = () => {
  const { data: session } = useSession()
  if (session) {
    return (
      <button className="btn btn-outline" onClick={() => signOut()}>Logout</button>
    )
  }
  return <Link href="/auth/login"><a className="btn btn-outline">Get Started</a></Link>
}

export default LoginButton