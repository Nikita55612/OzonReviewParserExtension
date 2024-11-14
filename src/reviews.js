
function readStorage() {
    chrome.storage.local.get("reviewData", (result) => {
        if (result.reviewData) {
            const container = document.querySelector('.container');
            
            const table = document.createElement('table');
            table.className = 'review-table';
            
            // Обновленный список заголовков
            const headers = [
            'Дата создания',
            'ID товара',
            'Автор',
            'ID автора',
            'Статус',
            'Оценка',
            'Комментарий',
            'Плюсы',
            'Минусы',
            'Контекстные вопросы',
            'Видео',
            'Фото',
            'Комментарии',
            ];
            
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            
            headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
            });
            
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            const tbody = document.createElement('tbody');
            
            result.reviewData.forEach(review => {
            const row = document.createElement('tr');
            
            // Дата создания
            const dateCell = document.createElement('td');
            const date = new Date(review.createdAt);
            dateCell.textContent = date.toLocaleString('ru-RU');
            row.appendChild(dateCell);
            
            // ID товара
            const itemIdCell = document.createElement('td');
            itemIdCell.textContent = review.itemId || '-';
            row.appendChild(itemIdCell);
            
            // Автор
            const authorCell = document.createElement('td');
            authorCell.textContent = review.author || '-';
            row.appendChild(authorCell);
            
            // ID автора
            const authorIdCell = document.createElement('td');
            authorIdCell.textContent = review.authorId || '-';
            row.appendChild(authorIdCell);
            
            // Статус
            const statusCell = document.createElement('td');
            statusCell.textContent = review.status || '-';
            row.appendChild(statusCell);
            
            // Оценка
            const scoreCell = document.createElement('td');
            scoreCell.textContent = review.score || '-';
            row.appendChild(scoreCell);
            
            // Комментарий
            const commentCell = document.createElement('td');
            commentCell.textContent = review.comment || '-';
            row.appendChild(commentCell);
            
            // Плюсы
            const positiveCell = document.createElement('td');
            positiveCell.textContent = review.positive || '-';
            row.appendChild(positiveCell);
            
            // Минусы
            const negativeCell = document.createElement('td');
            negativeCell.textContent = review.negative || '-';
            row.appendChild(negativeCell);
            
            // Контекстные вопросы
            const questionsCell = document.createElement('td');
            questionsCell.textContent = review.contextQuestions ? 
                JSON.stringify(review.contextQuestions) : '-';
            row.appendChild(questionsCell);
            
            // Видео
            const videoCell = document.createElement('td');
            videoCell.textContent = review.videos || '0';
            row.appendChild(videoCell);
            
            // Фото
            const photoCell = document.createElement('td');
            photoCell.textContent = review.photos || '0';
            row.appendChild(photoCell);
            
            // Комментарии
            const commentsCell = document.createElement('td');
            commentsCell.textContent = review.comments ? 
                JSON.stringify(review.comments) : '-';
            row.appendChild(commentsCell);
            
            tbody.appendChild(row);
            });
            
            table.appendChild(tbody);
            container.innerHTML = '';
            container.appendChild(table);
        }
    });
}

// Устанавливаем интервал чтения хранилища каждые 500 мс
const intervalId = setInterval(readStorage, 500);

// Удаляем обработчик через 3 секунды
setTimeout(() => {
    clearInterval(intervalId);
    console.log("Чтение хранилища завершено");
}, 2000);


