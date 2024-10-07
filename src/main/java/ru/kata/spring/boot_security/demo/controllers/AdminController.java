package ru.kata.spring.boot_security.demo.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.repositories.RoleRepository;
import ru.kata.spring.boot_security.demo.services.UserService;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.Principal;
import java.util.List;


@RestController
@RequestMapping("/admin")
public class AdminController {

    private final UserService userService;
    private final RoleRepository roleDao;

    @Autowired
    public AdminController(UserService userService, RoleRepository roleDao) {
        this.userService = userService;
        this.roleDao = roleDao;
    }

    @GetMapping("/currentUser")
    public ResponseEntity<User> getCurrentUser(Principal principal) {
        User currentUser = userService.findByUsername(principal.getName());
        return new ResponseEntity<>(currentUser, HttpStatus.OK);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return new ResponseEntity<>(userService.getUsers(), HttpStatus.OK);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUser(id);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PostMapping("/users")
    public ResponseEntity<User> addUser(@RequestBody User user) {
        userService.saveUser(user);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable("id") Long id, @RequestBody User user,
                                           Principal principal, HttpServletResponse response) throws IOException {
        if (user.getId() == null || !user.getId().equals(id)) {
            return ResponseEntity.badRequest().body(null);
        }
        userService.updateUser(id, user);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<HttpStatus> deleteUser(@PathVariable("id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(HttpStatus.OK);
    }

    @GetMapping("users/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return new ResponseEntity<>(roleDao.findAll(), HttpStatus.OK);
    }
}
