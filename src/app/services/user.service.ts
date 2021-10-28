import { UserDTO, User } from 'comeunitymodels/src/db/User';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';

interface UpdateUserResponse {
  success: boolean,
  user?: User,
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpService) { }

  async createUser(dto: UserDTO): Promise<UpdateUserResponse> {
    try {
      const response = await this.http.post<UpdateUserResponse>('api/user', dto);
      return response;
    } catch (e) {
      return { success: false };
    }
  }
}
