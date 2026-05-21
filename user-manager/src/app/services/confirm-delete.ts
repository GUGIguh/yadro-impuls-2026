import { inject, Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private modal = inject(NzModalService);

  delete(message: string, onOk: () => void): void {
    this.modal.confirm({
      nzTitle: 'Подтверждение удаления',
      nzContent: message,
      nzOkText: 'Удалить',
      nzOkDanger: true,
      nzCancelText: 'Отмена',
      nzOnOk: onOk
    });
  }
}
