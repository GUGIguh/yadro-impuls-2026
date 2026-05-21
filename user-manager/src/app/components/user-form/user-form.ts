import {Component, inject, OnInit, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzMessageService } from 'ng-zorro-antd/message';
import { UserApi } from '../../services/user-api';
import { User } from '../../models/user.model';
import { UserStore } from '../../services/user-store';
import { Location } from '@angular/common';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCardModule
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserForm implements OnInit{
  private fb = inject(FormBuilder);
  private userApi = inject(UserApi);
  private userStore = inject(UserStore);
  private router = inject(Router);
  private message = inject(NzMessageService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  loading = signal(false);
  isEditMode = signal(false);
  userId = signal<number | null>(null);
  formLabel = signal <string> ("Создание");

  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_.]+$/)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    website: [''],
    address: this.fb.group({
      street: [''],
      suite: [''],
      city: [''],
      zipcode: ['']
    }),
    company: this.fb.group({
      name: [''],
      catchPhrase: [''],
      bs: ['']
    })
  });

  private markFormDirty(form: any): void {
    Object.values(form.controls).forEach((control: any) => {
      if (control.controls) {
        this.markFormDirty(control);
      } else {
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const curId =Number(params.get("id"));

      if (curId){
        this.isEditMode.set(true);
        this.userId.set(curId);
        this.formLabel.set("Редактирование");

        this.userApi.getUserById(curId).subscribe(user => {
          console.log(user);
          this.form.patchValue(user)
        })
      }
      else {
        this.isEditMode.set(false);
      }
    })
  }

  onSubmit(): void {
    if (this.form.invalid) {
        this.markFormDirty(this.form);
      return;
    }

    this.loading.set(true);

    const userData: User = this.form.value;

    if (this.isEditMode()) {
      this.userApi.updateUser(this.userId()!,userData).subscribe({
        next: (updatedUser) => {
          this.userStore.updateUser(this.userId()!,userData);
          console.log(userData);
          console.log(updatedUser);
          this.message.success('Пользователь успешно отредактирован');
          this.router.navigate(['/users']);
        },
        error: (err) => {
          this.message.error('Ошибка при редактировании пользователя');
          console.error(err);
          this.loading.set(false);
        }
      });

    }
    else{
      this.userApi.createUser(userData).subscribe({
        next: (createdUser) => {
          console.log(createdUser);
          const functionResult = this.userStore.addNewUser(createdUser);
          console.log(functionResult);
          if(functionResult.isCorrect){
            this.message.success('Пользователь успешно создан');
            this.router.navigate(['/users']);
          }
          else{
            this.message.error(`Ошибка создания, ${functionResult.message}`);
            this.loading.set(false);
          }
        },
        error: (err) => {
          this.message.error('Ошибка при создании пользователя');
          console.error(err);
          this.loading.set(false);
        }
      });
    }
  }

  onCancel(): void {
    if (window.history.length > 1) {
      this.location.back();
    }
    else{
      this.router.navigate(['/users']).catch(error => {
        console.log("Ошибка при навигации",error);
      })
    }
  }
}
