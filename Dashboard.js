document.addEventListener('DOMContentLoaded', function() {
    const userData = [
        { name: "John Doe", email: "john@example.com" },
        { name: "Jane Smith", email: "jane@example.com" },
        
    ];

    const tableBody = document.querySelector('#userData tbody');

    userData.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
        `;
        tableBody.appendChild(row);
    });
});
