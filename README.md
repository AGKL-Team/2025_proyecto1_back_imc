# Calculadora de IMC

## 📌 Descripción

Aplicación que permite calcular el Índice de Masa Corporal (IMC) a partir del peso y la altura del usuario.  
El sistema indica en qué rango se encuentra la persona (bajo peso, normal, sobrepeso, obesidad).

## 🎯 Alcance

- Ingreso de datos básicos (peso y altura).
- Cálculo automático del IMC con la fórmula:
  - $\text{IMC} = \frac{\text{peso}} {\text{altura}^2}$.
- Clasificación de resultados según la OMS.
- API que expone los cálculos para el frontend.

## 📌 Requisitos previos

- Node.js v18+
- Yarn

> [!NOTE]
> Para instalar los programas necesarios:
> Node: [descargar Node](https://nodejs.org/en/download/)
> Yarn: [descargar yarn](https://classic.yarnpkg.com/en/docs/install#debian-stable)

## ⚒️ Instalación

```bash
git clone https://github.com/AGKL-Team/2025_proyecto1_back_imc
cd ./2025_proyecto1_back_imc
yarn install
```

## ▶️ Ejecución

```bash
# Modo desarrollo
yarn run start

# Modo watch
yarn run start:dev
```

## 🧪 Tests

```bash
# Unit tests
yarn run test

# Cobertura
yarn run test:cov
```

## 🌐 Despliegue en producción

```bash
# Instalar el CLI de vercel
npm install -g vercel

# Loguearse
vercel login

# Para deploys

## Para un deploy con dominio temporal (Preview)
## Genera una url específica para la branch
vercel

## Para un deploy con dominio fijo (Production)
vercel --prod
```

## 👨‍💻 Autores

- AGKL Team
  - Amante Aldana
  - Gutierrez Alexis
  - Koncurat Thomas
  - Lattazi Valentino

- [Universidad Tecnológica Nacional - Villa María](https://www.google.com/url?sa=t&source=web&rct=j&opi=89978449&url=https://www.frvm.utn.edu.ar/&ved=2ahUKEwidzN2etMSPAxW5IrkGHa5TAT0QFnoECDkQAQ&usg=AOvVaw2wudWAq9epLXJwg2kQfyWs)
- Materia: Ingeniería de Software
