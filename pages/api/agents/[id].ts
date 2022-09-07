import { Employee, User } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import { UpdateAgent } from '../../../lib/models';
import prisma from '../../../lib/prisma';

const updateAgent = async (
  req: NextApiRequest,
): Promise<{ status: boolean, data?: any }> => {
  const { id } = req.query as { [key: string]: string }
  const eeId = parseInt(id);
  if (isNaN(eeId)) return { status: false, data: 'Employee not found.' };
  
  const userInput = req.body as UpdateAgent
  
  try {
    const ee = await prisma.employee.update({
      where: { id: eeId },
      data: {
        name: userInput.name,
        email: userInput.email,
        address: userInput.address,
        address_2: userInput.address_2,
        city: userInput.city,
        state: userInput.state,
        postal_code: userInput.zip,
        // user: {
        //   connect: {
        //     id: eeId,
        //   },
        //   update: {
        //     email: userInput.email,
        //   },
        // },
      }
    })
    
    return { status: true }
  } catch (ex) {
    
    return { status: false, data: ex }
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<User & { employee: Employee }>,
) {
  switch (req.method) {
    case 'PUT':
      const updated = await updateAgent(req)
      return updated.status ? res.json(req.body) : res.status(400).json(updated.data);
    default:
      return res.status(405)
  }
}
