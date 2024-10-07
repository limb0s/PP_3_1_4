document.addEventListener('DOMContentLoaded', function () {
    let currentID = null;
    fetchCurrentUser();
    fetchUsers();
    loadRoles();
    setupCloseButtons();

});

function fetchCurrentUser() {
    console.log('Fetching current user info...');
    fetch('/admin/currentUser')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch current user info');
            }
            return response.json();
        })
        .then(user => {
            console.log('Current user fetched:', user);
            currentID = user.id;
            let roles = user.authorities.map(role => role.authority.substring(5)).join(", ");
            document.getElementById("currentUsername").textContent = user.username;
            document.getElementById("currentRoles").textContent = roles;
        })
        .catch(error => {
            console.error('Error fetching current user info:', error);
        });
}

function fetchUsers() {
    console.log('Fetching users...');
    fetch('/admin/users') // Проверьте этот URL
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }
            return response.json();
        })
        .then(response => {
            console.log('Users fetched:', response);
            const tableBody = document.getElementById('userTable');
            tableBody.innerHTML = '';
            response.forEach(user => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td> 
                    <td>${user.age}</td>
                    <td>${user.username}</td>
                    <td>${user.roles.map(role => role.name.substring(5)).join(', ')}</td> 
                    <td><button class="btn btn-info" onclick="openEditUserPopup(${user.id})">Edit</button></td>
                    <td><button class="btn btn-danger" onclick="openDeleteUserPopup(${user.id})">Delete</button></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            alert('Ошибка при загрузке пользователей');
        });
}

function loadRoles() {
    console.log('Loading roles...');
    fetch('/admin/users/roles')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch roles');
            }
            return response.json();
        })
        .then(roles => {
            console.log('Roles fetched:', roles);
            const roleSelect = document.getElementById('roles');
            const editRoleSelect = document.getElementById('editRoles');
            roleSelect.innerHTML = '';
            editRoleSelect.innerHTML = '';
            roles.forEach(role => {
                const option = document.createElement('option');
                option.value = role.id;
                option.text = role.authority.substring(5);
                roleSelect.appendChild(option);
                const editOption = document.createElement('option');
                editOption.value = role.id;
                editOption.text = role.authority.substring(5);
                editRoleSelect.appendChild(editOption);
            });
        })
        .catch(error => {
            console.error('Error loading roles:', error);
            alert('Ошибка при загрузке ролей');
        });
}

document.getElementById('addUser').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const rolesSelected = Array.from(document.getElementById('roles').selectedOptions).map(option => ({
        id: parseInt(option.value, 10)
    }));
    const user = {
        name: formData.get('newName'),
        age: parseInt(formData.get('newAge'), 10),
        username: formData.get('newUsername'),
        password: formData.get('newPassword'),
        roles: rolesSelected
    };
    console.log('Creating user:', user);
    fetch('/admin/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (response.ok) {
                fetchUsers();
                alert('Пользователь успешно создан!');
                this.reset();
            } else {
                return response.json().then(data => {
                    throw new Error(data.message || 'Не удалось создать пользователя');
                });
            }
        })
        .catch(error => {
            console.error('Error creating user:', error);
            alert('Ошибка при создании пользователя: ' + error.message);
        });
});

function openEditUserPopup(userId) {
    console.log('Opening edit modal for user ID:', userId);
    fetch(`/admin/users/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            return response.json();
        })
        .then(user => {
            console.log('User fetched for edit:', user);
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editName').value = user.name;
            document.getElementById('editAge').value = user.age;
            document.getElementById('editUsername').value = user.username;
            document.getElementById('editPassword').value = '';
            const editRolesSelect = document.getElementById('editRoles');
            Array.from(editRolesSelect.options).forEach(option => {
                option.selected = user.roles.some(role => role.id === parseInt(option.value, 10));
            });
            openModal('editUserModal');
        })
        .catch(error => {
            console.error('Error fetching user:', error);
            alert('Ошибка при загрузке данных пользователя');
        });
}

// Обработчик отправки формы редактирования пользователя
document.getElementById('editUserForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const userId = parseInt(formData.get('id'), 10);
    const rolesSelected = Array.from(document.getElementById('editRoles').selectedOptions).map(option => ({
        id: parseInt(option.value, 10)
    }));
    const userAge = parseInt(formData.get('editAge'), 10);
    console.log('userId:', userId, 'userAge:', userAge);

    const user = {
        id: userId,
        name: formData.get('editName'),
        age: parseInt(formData.get('editAge'), 10),
        username: formData.get('editUsername'),
        password: formData.get('editPassword'),
        roles: rolesSelected
    };
    console.log('Updating user:', user);
    fetch(`/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (response.ok) {
                fetchUsers();
                alert('Пользователь успешно обновлен!');
                closeModal('editUserModal');
            } else {
                return response.json().then(data => {
                    console.error('Ошибка обновления:', data);
                    alert('Ошибка при обновлении пользователя: ' + data.message);
                });
            }
        })
        .catch(error => {
            console.error('Error updating user:', error);
            alert('Ошибка при обновлении пользователя: ' + error.message);
        });
});

function openDeleteUserPopup(userId) {
    console.log('Opening delete modal for user ID:', userId);
    fetch(`/admin/users/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            return response.json();
        })
        .then(user => {
            console.log('User fetched for delete:', user);
            document.getElementById('deleteId').value = user.id;
            document.getElementById('deleteName').value = user.name;
            document.getElementById('deleteAge').value = user.age;
            document.getElementById('deleteUsername').value = user.username;
            document.getElementById('deletePassword').value = user.password;
            openModal('deleteUserModal');
        })
        .catch(error => {
            console.error('Error fetching user:', error);
            alert('Ошибка при загрузке данных пользователя');
        });
}


document.getElementById('deleteUserForm').addEventListener('submit', function (event) {
    event.preventDefault();
    const formData = new FormData(this);
    const userId = parseInt(formData.get('id'), 10);
    const rolesSelected = Array.from(document.getElementById('editRoles').selectedOptions).map(option => ({
        id: parseInt(option.value, 10)
    }));
    const userAge = parseInt(formData.get('editAge'), 10);
    console.log('userId:', userId, 'userAge:', userAge);

    const user = {
        id: userId,
        name: formData.get('deleteName'),
        age: parseInt(formData.get('deleteAge'), 10),
        username: formData.get('deleteUsername'),
        password: formData.get('deletePassword'),
    };
    console.log('Delete user:', user);
    fetch(`/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    })
        .then(response => {
            if (response.ok) {
                if(currentID === userId){
                    window.location.replace('/logout');
                }
                fetchUsers();
                alert('Пользователь успешно удален!');
                closeModal('deleteUserModal');
            } else {
                return response.json().then(data => {
                    console.error('Ошибка обновления:', data);
                    alert('Ошибка при удалении пользователя: ' + data.message);
                });
            }
        })
        .catch(error => {
            console.error('Error updating user:', error);
            alert('Ошибка при удалении пользователя: ' + error.message);
        });
});

document.getElementById('closeDeleteUserModal').addEventListener('click', function () {
    closeModal('deleteUserModal');
});

document.getElementById('closeEditUserModal').addEventListener('click', function () {
    closeModal('editUserModal');
});

function openModal(modalId) {
    console.log('Opening modal:', modalId);
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}


function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Восстанавливает прокрутку страницы
}

function setupCloseButtons() {
    const closeButtons = document.querySelectorAll('.close-popup');
    closeButtons.forEach(button => {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                closeModal(modalId);
            }
        });
    });
}