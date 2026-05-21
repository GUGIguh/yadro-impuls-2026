import {Component, inject, signal, OnInit} from '@angular/core';
import {CommonModule, Location} from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserApi } from '../../services/user-api';
import { UserStore } from '../../services/user-store';
import { User } from '../../models/user.model';
import {ConfirmService} from "../../services/confirm-delete";

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzCardModule,
    NzDescriptionsModule,
    NzButtonModule,
    NzIconModule,
    NzDividerModule,
    NzSpinModule,
  ],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss'
})
export class UserDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userApi = inject(UserApi);
  private userStore = inject(UserStore);
  private confirm = inject(ConfirmService);
  private message = inject(NzMessageService);
  private location = inject(Location);

  user = signal<User | null>(null);
  loading = signal(true);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadUser(id);
    }
  }

  loadUser(id: number): void {

    const cached = this.userStore.users().find(u => u.id === id);
    if (cached) {
      this.user.set(cached);
      this.loading.set(false);
      return;
    }

    this.userApi.getUserById(id).subscribe({
      next: (data) => {
        this.user.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.message.error('Пользователь не найден');
      }
    });
  }

  editUser(): void {
    const id = this.user()?.id;
    if (id) {
      void this.router.navigate(['/users', id, 'edit']);
    }
  }

  deleteUser(): void {
    const currentUser = this.user();

    if (!currentUser) return;

    this.confirm.delete(
        `Удалить пользователя "${currentUser.name}"?`,
        () => {
          this.userApi.deleteUser(currentUser.id).subscribe({
            next: () => {
              this.userStore.removeUser(currentUser.id);
              this.message.success('Пользователь удалён');
              void this.router.navigate(['/users']);
            },
            error: (err) => console.error(err)
          });
        }
    );
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/users']).catch(error => {
        console.log("Ошибка при навигации",error);
      })
    }
  }
}
