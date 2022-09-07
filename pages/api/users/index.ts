import { Employee, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { Paginator } from '../../../lib/models/paginator.model';
import userService from '../../../lib/services/user.service';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Paginator<(User & { employee: Employee })[]>>
) {
  if (req.method !== 'GET') return res.status(405);
  
  const {userId, clientId, page, take} = req.query as any;
  
  try {
    const results = await userService.getAgents(
      parseInt(userId, 10), 
      parseInt(clientId, 10), 
      parseInt(page, 10),
      parseInt(take, 10));
      
    res.status(200).json(results)  
  } catch (ex) {
    res.status(500).json(ex); 
  }
}
