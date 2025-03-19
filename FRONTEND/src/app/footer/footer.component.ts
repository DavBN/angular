import { Component } from '@angular/core'; //---> Importación de angular

@Component({ //---> Componente
  selector: 'app-footer', //---> Selector para importar en otros componentes
  standalone: true, //---> Validación si es standalone, ósea un componente independiente
  imports: [], //---> Importaciones
  templateUrl: './footer.component.html', //---> Ubicación del html
  styleUrl: './footer.component.css' //---> Ubicación del css
})
export class FooterComponent { //---> Clase del componente

}
