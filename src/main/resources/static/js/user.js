document.addEventListener("DOMContentLoaded", function () {
    fetch("/user/show")
        .then(response => response.json())
        .then(user => {
            let roles = user.authorities.map(role => role.authority.substring(5)).join(", ");
            let rolesAdmin = user.authorities.map(role => role.authority);
            const isAdmin = rolesAdmin.some(role => role === 'ROLE_ADMIN');
            if (isAdmin) {
                document.getElementById('admin-tab').style.display = 'block';
            }
            document.getElementById("currentUsername").textContent = user.username;
            document.getElementById("currentRoles").textContent = roles;
            document.getElementById('id').textContent = user.id;
            document.getElementById("name").textContent = user.name;
            document.getElementById('age').textContent = user.age;
            document.getElementById("username").textContent = user.username;
            document.getElementById('roles').textContent = roles;
        })
        .catch(error => console.error("Error fetching user data:", error));
});