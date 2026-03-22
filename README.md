# Método de Bisección — Calculadora Web

Aplicación web para encontrar raíces de funciones mediante el método de bisección numérico. Permite ingresar cualquier función continua, definir un intervalo de búsqueda y visualizar el proceso iterativo completo con gráfica y tabla de resultados.

---

## Estructura del proyecto

```
biseccion/
├── index.html      # Estructura HTML y punto de entrada
├── script.js       # Lógica del método de bisección y renderizado
└── styles.css      # Estilos e interfaz visual
```

---

## Tecnologías utilizadas

| Librería | Versión | Uso |
|---|---|---|
| [Math.js](https://mathjs.org/) | 12.4.0 | Parseo y evaluación de funciones escritas por el usuario |
| [Chart.js](https://www.chartjs.org/) | 4.4.1 | Graficación de f(x) con la raíz marcada |

Ambas se cargan vía CDN, no requieren instalación.

---

## Cómo usar

1. Ingresa en `https://andrikesquer.github.io/metodo_biseccion/` o si has clonado el repositorio abre `index.html` en cualquier navegador moderno (Chrome, Firefox, Edge)
2. Escribe la función f(x) en el campo de entrada usando la sintaxis indicada
3. Define el intervalo [xa, xb] donde se sospecha que existe la raíz
4. Ajusta la tolerancia de error y el número máximo de iteraciones si lo necesitas
5. Haz clic en **Calcular raíz**

No requiere servidor, instalación de dependencias ni configuración adicional.

---

## Sintaxis de funciones

El campo f(x) acepta expresiones matemáticas estándar:

| Operación | Sintaxis |
|---|---|
| Suma / resta | `x + 2`, `x - 5` |
| Multiplicación | `3*x` (el `*` es obligatorio) |
| Potencia | `x^3`, `x^0.5` |
| Raíz cuadrada | `sqrt(x)` |
| Exponencial | `exp(x)` |
| Logaritmo natural | `log(x)` |
| Trigonométricas | `sin(x)`, `cos(x)`, `tan(x)` |
| Constante e, π | `e`, `pi` |

### Ejemplos de funciones válidas

```
x^4 + 3*x^3 - 2        → raíz en [0, 1]
x^3 - x - 2            → raíz en [1, 2]
cos(x) - x             → raíz en [0, 1]
exp(x) - 3*x           → raíz en [0, 1]
x^2 - 2                → raíz en [1, 2]  (≈ √2)
```

---

## Descripción del método

El método de bisección localiza raíces reales de funciones continuas aplicando el **Teorema del Valor Intermedio**: si f(xa) y f(xb) tienen signos opuestos, existe al menos una raíz en [xa, xb].

El algoritmo en cada iteración:

1. Calcula el punto medio: `xr = (xa + xb) / 2`
2. Evalúa `f(xr)`
3. Revisa el signo de `f(xa) · f(xr)`:
   - Si es **negativo** → la raíz está en [xa, xr] → `xb = xr`
   - Si es **positivo** → la raíz está en [xr, xb] → `xa = xr`
4. Calcula el error porcentual: `Ep = |( xr_actual − xr_anterior ) / xr_actual| × 100`
5. Repite hasta que `Ep < tolerancia` o se alcance el máximo de iteraciones

---

## Resultados que genera el programa

- **Raíz aproximada** y valor de f(xr) al finalizar
- **Error porcentual final** y número de iteraciones realizadas
- **Gráfica interactiva** de f(x) en el intervalo con la raíz marcada
- **Barras de convergencia** que muestran cómo disminuye el error por iteración
- **Tabla completa** de iteraciones con: xa, xb, f(xa), f(xb), xr, f(xr), f(xa)·f(xr) y Ep

---

## Casos de prueba

Funciones recomendadas para demostrar el funcionamiento:

| # | f(x) | xa | xb | Raíz esperada |
|---|---|---|---|---|
| 1 | `x^4 + 3*x^3 - 2` | 0 | 1 | ≈ 0.8069 |
| 2 | `x^3 - x - 2` | 1 | 2 | ≈ 1.5214 |
| 3 | `cos(x) - x` | 0 | 1 | ≈ 0.7391 |
| 4 | `exp(x) - 3*x` | 0 | 1 | ≈ 0.6190 |
| 5 | `x^2 - 2` | 1 | 2 | ≈ 1.4142 |

---

## Manejo de errores

El programa valida las entradas y muestra mensajes descriptivos en los siguientes casos:

- Campo f(x) vacío
- Intervalo inválido (xa ≥ xb)
- Sintaxis incorrecta en la función
- Sin cambio de signo en el intervalo indicado (no se puede garantizar una raíz)
