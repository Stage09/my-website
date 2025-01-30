document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loading").style.display = "none";
    loadSections();
});

const adminLogin = document.getElementById("admin-login");
const adminPanel = document.getElementById("admin-panel");
const addSectionForm = document.getElementById("add-section-form");
const sectionsContainer = document.getElementById("sections");
let isAdmin = false; // Переменная для отслеживания состояния администратора

const ADMIN_CREDENTIALS = { username: "admin", password: "1234" };

// Пытаемся авторизоваться как админ
adminLogin.addEventListener("click", () => {
    const username = prompt("Введите имя пользователя администратора:");
    const password = prompt("Введите пароль администратора:");
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        alert("Добро пожаловать, администратор!");
        isAdmin = true;
        adminPanel.classList.remove("hidden"); // Показываем панель администратора
        loadSections(); // Загружаем секции снова, чтобы обновить интерфейс
    } else {
        alert("Неверные учетные данные!");
    }
});

// Обработка формы добавления секции
addSectionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("section-title").value;
    const content = document.getElementById("section-content").value;
    const link = document.getElementById("section-link").value;
    const imageInput = document.getElementById("section-image");
    let imageUrl = "";

    if (imageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
            createSection(title, content, link, e.target.result);
        };
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        createSection(title, content, link, imageUrl);
    }
    addSectionForm.reset();
});

// Создание секции
function createSection(title, content, link, imageUrl) {
    const section = document.createElement("div");
    section.classList.add("section");

    section.innerHTML = `
        <h3>${title}</h3>
        <p>${content}</p>
        ${link ? `<a href="${link}" target="_blank">Проект</a>` : ""}
        ${imageUrl ? `<img src="${imageUrl}" alt="Изображение" class="section-image">` : ""}
        ${isAdmin ? `<button class="edit">Редактировать</button>` : ""}
        ${isAdmin ? `<button class="delete">Удалить</button>` : ""}
    `;

    // Если пользователь администратор, добавляем обработчики для кнопок
    if (isAdmin) {
        section.querySelector(".edit").addEventListener("click", () => {
            const newTitle = prompt("Изменить заголовок:", title);
            const newContent = prompt("Изменить описание:", content);
            const newLink = prompt("Изменить ссылку на проект:", link);

            // Меняем заголовок, описание и ссылку
            if (newTitle) section.querySelector("h3").textContent = newTitle;
            if (newContent) section.querySelector("p").textContent = newContent;
            if (newLink) {
                let linkElement = section.querySelector("a");
                if (!linkElement) {
                    linkElement = document.createElement("a");
                    section.appendChild(linkElement);
                }
                linkElement.href = newLink;
                linkElement.textContent = "проект";
            }

            // Меняем изображение
            const newImageInput = prompt("Введите новый URL изображения или загрузите новое изображение:");
            if (newImageInput) {
                if (newImageInput.startsWith("http") || newImageInput.startsWith("data:image")) {
                    section.querySelector("img").src = newImageInput;
                } else {
                    alert("Некорректный URL изображения.");
                }
            }

            saveSections(); // Сохраняем изменения
        });

        section.querySelector(".delete").addEventListener("click", () => {
            if (confirm("Вы уверены, что хотите удалить эту секцию?")) {
                section.remove();
                saveSections();
            }
        });
    }

    // Добавляем секцию в контейнер
    sectionsContainer.appendChild(section);
    saveSections(); // Сохраняем обновленные секции
}

// Сохранение секций в localStorage
function saveSections() {
    const sections = Array.from(sectionsContainer.children).map(section => ({
        title: section.querySelector("h3").textContent,
        content: section.querySelector("p").textContent,
        link: section.querySelector("a") ? section.querySelector("a").href : "",
        imageUrl: section.querySelector("img") ? section.querySelector("img").src : ""
    }));
    localStorage.setItem("sections", JSON.stringify(sections));
}

// Загрузка секций из localStorage
function loadSections() {
    // Загружаем секции из localStorage
    const savedSections = JSON.parse(localStorage.getItem("sections")) || [];

    // Очищаем контейнер секций
    sectionsContainer.innerHTML = "";

    // Создаем секции для каждого сохраненного элемента
    savedSections.forEach(({ title, content, link, imageUrl }) => {
        createSection(title, content, link, imageUrl);
    });
}