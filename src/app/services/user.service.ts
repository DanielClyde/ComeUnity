import { UserDTO, User } from 'comeunitymodels';
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

  async updateUserInterests(userId: string, interests: string[]) {
    try {
      const response = await this.http.put<UpdateUserResponse>('api/user/' + userId, { interests })
      return response;
    } catch (e) {
      return { success: false };
    }
  }
}
