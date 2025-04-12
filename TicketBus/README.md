# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## RUN
Npm run dev

## Json giả định doanh thu
npm install -g json-server  
json-server --watch db.json --port 5000 // giả lập doanh thu , nếu muốn chạy , + terminal


## nếu cài lỗi thì hãy thêm --legacy-peer-deps(tất cả)

## Install
npm install
npx tsc --init
npm i typescript
npm i react-router-dom react-icons framer-motion
npm install -D @types/node   
npm install react-intersection-observer
npm i next.js --lagacy-peer-deps ( cái này chắc cần cài để BE)

## install Tailwindcss
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p

## Install Ui , nếu chạy lỗi mới install , không thì không cần
npx shadcn@latest add popover calendar button
npx shadcn@latest add slider
npm install @mui/material @emotion/react @emotion/styled --legacy-peer-deps
npx shadcn@latest add card
npm install recharts --legacy-peer-deps
npm install react-calendar --legacy-peer-deps
npx shadcn@latest add calendar
npx shadcn@latest init  ( dùng --legacy-peer-deps , newyork )

### Facebook
npm install react-facebook-login --force

npm install @mui/material @mui/icons-material @emotion/react @emotion/styled axios

npm i date-fns --force

npm install react-qr-reader --force
npm install react-qr-code --force  

npm install react-leaflet leaflet --force