
import {  getServerSession } from 'next-auth'

import { redirect } from 'next/navigation'
import Intermedio from './Intermedio'
import { authOptions } from '@/lib/authOptions'



export default async function page() {
      const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/Login")
  }

 

  if(session.user?.rol !== 'PROFESOR') {
    redirect("/Student")
  }

  console.log(session.user)
 
  
    return (
       <Intermedio user={session}  />
    )
}
