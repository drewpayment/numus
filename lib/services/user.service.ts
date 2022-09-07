import { Employee, PrismaClient, User } from '@prisma/client';
import { serializeDate } from '../date.extensions';
import { Paginator } from '../models/paginator.model';
import prisma from '../prisma';

const userService = {
  getUser: async (key: string, value: string): Promise<User> => {
    return new Promise<User>(async (res, rej) => {
      const params = {};
      params[key] = value;
      
      const user = await prisma.user.findFirst({
        where: params,
      });
      
      if (!user) rej();
      else res(user);
    })
  },
  
  getAgents: async (userId: number, clientId: number, page: number, take: number = 10): Promise<Paginator<(User & { employee: Employee })[]>> => {
    if (take > 25) take = 25; // protecting upper bound because of terrible sort by name
    const res = new Promise<Paginator<(User & { employee: Employee })[]>>(async (resolve, reject): Promise<Paginator<(User & { employee: Employee })[]>> => {
      let hasAccessToClient = false;
    
      const user = await prisma.user.findFirst({
        where: { uid: userId, },
        include: {
          clients: true,
        },
      })
      
      if (!user) {
        reject();
        return;
      }
      
      hasAccessToClient = user.clients.some(c => c.clientId === clientId);
      
      if (!hasAccessToClient) {
        reject();
        return;
      }
      
      const skip = (page - 1) * take;
      let result: (User & {employee: Employee})[];
      const qryResult = (
        await prisma.clientsOfUsers.findMany({
          where: { clientId },
          select: {
            user: {
              select: {
                uid: true,
                id: true,
                name: true,
                email: true,
                created_at: true,
                updated_at: true,
                deleted_at: true,
                employee: true,
                selectedClientId: true,
              },
            },
          },
          skip,
          take,
        })
      )
      
      if (qryResult) {
        result = qryResult.map((clientUser) => ({
          ...clientUser.user,
          created_at: serializeDate(clientUser.user.created_at),
          updated_at: serializeDate(clientUser.user.updated_at),
          deleted_at: serializeDate(clientUser.user.deleted_at),
          employee: {
            ...clientUser.user.employee,
            created_at: serializeDate(clientUser.user.employee.created_at),
            updated_at: serializeDate(clientUser.user.employee.updated_at),
            deleted_at: serializeDate(clientUser.user.employee.deleted_at),
          },
        } as unknown as  (User & { employee: Employee }))).sort((a, b) => a.name.localeCompare(b.name));
      }

      resolve({
        data: result,
        page,
        take,
      });
    });
    
    return res;
  },
};

export default userService;