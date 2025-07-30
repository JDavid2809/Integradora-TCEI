
import { getServerSession } from 'next-auth'

import { redirect } from 'next/navigation'
import Intermedio from '../Teachers/Intermedio'
import { authOptions } from '@/lib/authOptions'

export default async function page() {

        const session = await getServerSession(authOptions)
      
      if (!session) {
        redirect("/Login")
      }
    

    return (
        <Intermedio user={session} />
    )
}
