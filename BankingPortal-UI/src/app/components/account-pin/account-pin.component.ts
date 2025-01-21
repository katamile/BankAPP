import { ToastService } from 'angular-toastify';
import { ApiService } from 'src/app/services/api.service';
import { LoadermodelService } from 'src/app/services/loadermodel.service';

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { passwordMismatch } from 'src/app/util/formutil';

@Component({
  selector: 'app-account-pin',
  templateUrl: './account-pin.component.html',
  styleUrls: ['./account-pin.component.css'],
})
export class AccountPinComponent implements OnInit {
  showGeneratePINForm: boolean = true;
  pinChangeForm!: FormGroup;
  loading: boolean = true;

  print = console.log;

  constructor(
    private apiService: ApiService,
    private _toastService: ToastService,
    private router: Router,
    private loader: LoadermodelService // Inject the LoaderService here
  ) {}

  ngOnInit(): void {
    this.apiService.checkPinCreated().subscribe({
      next: (response: any) => {
        if (response && response.hasPIN) {
          // El usuario ya ha creado un PIN, mostrar el formulario "Cambiar PIN".
          this.showGeneratePINForm = false;
        }
        this.initPinChangeForm();
        this.loading = false; // Establecer loading en false después de recibir la respuesta de la API.
      },
      error: (error: any) => {
        this.loading = false; // Establecer loading en false en caso de error.
        console.error('Error al verificar el estado del PIN:', error);
      },
    });
  }

  initPinChangeForm(): void {
    if (this.showGeneratePINForm) {
      // Para el formulario "Generar PIN"
      this.pinChangeForm = new FormGroup(
        {
          newPin: new FormControl('', [
            Validators.required,
            Validators.minLength(4),
            Validators.maxLength(4),
          ]),
          confirmPin: new FormControl('', Validators.required),
          password: new FormControl('', Validators.required),
        },
        {
          validators: passwordMismatch('newPin', 'confirmPin'),
        }
      );
    } else {
      // Para el formulario "Cambiar PIN"
      this.pinChangeForm = new FormGroup({
        oldPin: new FormControl('', [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
        ]),
        newPin: new FormControl('', [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(4),
        ]),
        password: new FormControl('', Validators.required),
      });
    }
  }

  onSubmitGeneratePIN(): void {
    if (this.pinChangeForm.valid) {
      const newPin = this.pinChangeForm.get('newPin')?.value;
      const password = this.pinChangeForm.get('password')?.value;

      this.loader.show('Generando PIN...'); // Mostrar el loader antes de realizar la llamada a la API
      // Llamar a la API para generar un PIN.
      this.apiService.createPin(newPin, password).subscribe({
        next: (response: any) => {
          this.loader.hide(); // Ocultar el loader tras generar el PIN con éxito
          this._toastService.success('PIN generado correctamente');
          console.log('PIN generado correctamente:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.loader.hide(); // Ocultar el loader tras un fallo en la solicitud de generación del PIN
          this._toastService.error(error.error);
          console.error('Error al generar el PIN:', error);
        },
      });
    }
  }

  onSubmitChangePIN(): void {
    if (this.pinChangeForm.valid) {
      const oldPin = this.pinChangeForm.get('oldPin')?.value;
      const newPin = this.pinChangeForm.get('newPin')?.value;
      const password = this.pinChangeForm.get('password')?.value;

      this.loader.show('Actualizando PIN...'); // Mostrar el loader antes de realizar la llamada a la API
      // Llamar a la API para actualizar el PIN.
      this.apiService.updatePin(oldPin, newPin, password).subscribe({
        next: (response: any) => {
          this.loader.hide(); // Ocultar el loader tras actualizar el PIN con éxito
          this._toastService.success('PIN actualizado correctamente');
          console.log('PIN actualizado correctamente:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.loader.hide(); // Ocultar el loader tras un fallo en la solicitud de actualización del PIN
          this._toastService.error(error.error);
          console.error('Error al actualizar el PIN:', error);
        },
      });
    }
  }
}