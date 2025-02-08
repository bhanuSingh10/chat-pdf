import { SignUp, useUser } from '@clerk/nextjs'

export default function Page() {
//   const { user } = useUser()

//   if (!user) {
    return (
    <div className='absolute top-1/2  left-1/2 -translate-x-1/2 -translate-y-1/2'><SignUp /></div>
    )
//   }

//   return <div>Welcome!</div>
}