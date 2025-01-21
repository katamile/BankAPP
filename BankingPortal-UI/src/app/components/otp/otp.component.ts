import { ToastService } from 'angular-toastify';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { LoadermodelService } from 'src/app/services/loadermodel.service';
import { environment } from 'src/environment/environment';

import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css'],
})
export class OtpComponent {
  identificador: string = '';
  otp: string = '';
  otpGenerado: boolean = false;
  nombreTokenAutenticacion = environment.tokenName;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private loader: LoadermodelService
  ) {}

  ngOnInit() {
    // Verificar si el número de cuenta existe en el sessionStorage (al recargar la página)
    const cuentaGuardada = sessionStorage.getItem('numeroCuenta');
    if (cuentaGuardada) {
      this.identificador = cuentaGuardada;
      this.otpGenerado = true;
    }
  }

  @ViewChild('ngOtpInput', { static: false }) ngOtpInput: any;
  configuracion = {
    allowNumbersOnly: true,
    length: 6,
    placeholder: '',
    inputStyles: {
      width: '50px',
      height: '50px',
    },
  };

  onOtpChange(otp: string) {
    this.otp = otp;
  }

  setVal(valor: string) {
    this.ngOtpInput.setValue(valor);
  }

  generarOTP() {
    this.loader.show('Generando OTP...'); // Mostrar cargador antes de realizar la llamada a la API
    this.authService
      .generateOTP(this.identificador)
      .pipe(
        finalize(() => {
          this.loader.hide(); // Ocultar cargador tras completar la llamada (éxito o error)
        })
      )
      .subscribe({
        next: (response: any) => {
          this.toastService.success(response.message + ', revisa tu correo');
          this.otpGenerado = true;
          // Guardar el número de cuenta en el sessionStorage
          sessionStorage.setItem('numeroCuenta', this.identificador);
        },
        error: (error: any) => {
          this.toastService.error(error.error);
          console.error(error);
        },
      });
  }

  verificarOTP() {
    this.loader.show('Verificando OTP...'); // Mostrar cargador antes de realizar la llamada a la API
    const solicitudVerificacionOTP = {
      identificador: this.identificador,
      otp: this.otp,
    };

    this.authService
      .verifyOTP(solicitudVerificacionOTP)
      .pipe(
        finalize(() => {
          // Ocultar cargador tras completar la llamada (éxito o error)
          this.loader.hide();
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.toastService.success('Cuenta autenticada correctamente');
          const token = response.token;
          localStorage.setItem(this.nombreTokenAutenticacion, token);
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.toastService.error(error.error);
          console.error(error);
        },
      });
  }
}
