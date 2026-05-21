import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserApi } from '../../services/user-api';
import { User } from '../../models/user.model';
import { UserStore } from '../../services/user-store';
import {ConfirmService} from '../../services/confirm-delete';


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzDropdownModule,
    NzIconModule,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss'
})
export class UserList implements OnInit {
  private userApi = inject(UserApi);
  private userStore = inject(UserStore);
  private router = inject(Router);
  private confirm = inject(ConfirmService);


  users = this.userStore.users;
  loading = signal(true);

  ngOnInit(): void {

    if (this.users().length > 0) {
      this.loading.set(false);
      return;
    }

    this.userApi.getUsers().subscribe({
      next: (data) => {
        this.userStore.setUsers(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки:', err);
        this.loading.set(false);
      }
    });
  }

  deleteUser(userId: number): void {
    const user = this.users().find(u => u.id === userId);

    this.confirm.delete(
      `Удалить пользователя "${user?.name}"?`,
      () => {
        this.userApi.deleteUser(userId).subscribe({
          next: () => this.userStore.removeUser(userId),
          error: (err) => console.error(err)
        });
      }
    );
  }

  nameFilters = computed(() => {
    const names = [...new Set(this.users().map(u => u.name))];
    return names.map(name => ({ text: name, value: name }));
  });

  emailFilters = computed(() => {
    const emails = [...new Set(this.users().map(u => u.email))];
    return emails.map(email => ({ text: email, value: email }));
  });

  nameFilterFn = (list: string[], item: User): boolean => {
    return list.some(name => item.name.includes(name));
  };

  emailFilterFn = (list: string[], item: User): boolean => {
    return list.some(email => item.email.includes(email));
  };

  isModified(userId: number): boolean {
    return  this.userStore.lastModifiedUsers().includes(userId);
  }

  openUserInfo(userId: number) {
    this.router.navigate(['/users', userId]).catch(error =>{
      console.error('Ошибка навигации', error);
    });
  }
}
