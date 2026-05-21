import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { UserApi } from '../../services/user-api';
import { FormsModule } from '@angular/forms';
import { UserStore } from '../../services/user-store';
import {ConfirmService} from '../../services/confirm-delete';
import {NzInputDirective} from 'ng-zorro-antd/input';


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    NzTableModule,
    NzButtonModule,
    NzDropdownModule,
    NzIconModule,
    NzInputDirective,
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
  emailSearchValue = signal("");
  nameSearchValue = signal("");
  visibleNameFilter = signal(false);
  visibleEmailFilter =signal(false);
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

  filteredUsers = computed(() => {
    let result = this.users();

    if (this.nameSearchValue().trim()) {
      result = result.filter(user =>
        user.name.toLowerCase().includes(this.nameSearchValue().toLowerCase().trim())
      );
    }

    if (this.emailSearchValue().trim()) {
      result = result.filter(user =>
        user.email.toLowerCase().includes(this.emailSearchValue().toLowerCase().trim())
      );
    }
    return result;
  });

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

  resetNameFilter =() => {
    this.nameSearchValue.set("");
  }

  resetEmailFilter = () => {
    this.emailSearchValue.set("");
  }

  isModified(userId: number): boolean {
    return  this.userStore.lastModifiedUsers().includes(userId);
  }

  openUserInfo(userId: number) {
    this.router.navigate(['/users', userId]).catch(error =>{
      console.error('Ошибка навигации', error);
    });
  }
}
