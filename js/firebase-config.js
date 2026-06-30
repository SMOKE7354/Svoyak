// Необязательно: для надёжной игры на двух ноутбуках через интернет
// 1. Создайте проект на https://console.firebase.google.com
// 2. Realtime Database → создать → правила: { "rules": { ".read": true, ".write": true } }
// 3. Скопируйте конфиг сюда:
window.firebaseConfig = {
    // apiKey: "...",
    // authDomain: "...",
    // databaseURL: "https://ВАШ-ПРОЕКТ-default-rtdb.firebaseio.com",
    // projectId: "..."
};
