import {Injectable, signal} from '@angular/core';
import {User} from '../models/user.model';


type creationResult = {
  isCorrect: boolean;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class UserStore {
  private queueSize = 3;
  users = signal<User[]>([]);
  lastModifiedUsers = signal<number[]>([]);

  addNewUser(value: User):creationResult{
    if (this.users().some(user => user.id === value.id)) {
      return {isCorrect: false ,message: "Такой id уже занят"}
    }
    else {
      this.users.update(users => [...users, value]);
      return {isCorrect: true,message: "Пользователь создан"};
    }
  }

  updateUser(userId:number,updatedUser: User){
    this.users.update(users => users.map( user => user.id === userId ? { ...user,...updatedUser,userId }: user));

    this.updateQueue(userId)
  }

  removeUser(id: number){
    this.users.update(users => users.filter( user => user.id !== id));
  }

  setUsers(newUsers: User[]){
    this.users.set(newUsers);
  }

  updateQueue(userId: number) {
    if (this.lastModifiedUsers().includes(userId)) return;

    this.lastModifiedUsers.update(prev => {

      if (prev.length >= this.queueSize) {
        return [...prev.slice(1), userId]
      }

      return [...prev, userId]
    })
  }


}
