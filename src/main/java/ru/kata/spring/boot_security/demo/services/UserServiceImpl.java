package ru.kata.spring.boot_security.demo.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUser(Long id) {
        Optional<User> user = userRepository.findById(id);
        return user.orElse(new User());
    }

    @Transactional
    @Override
    public void saveUser(User user) {
        user.setPassword(new BCryptPasswordEncoder().encode(user.getPassword()));
        user.setRoles(user.getRoles());
        userRepository.save(user);
    }

    @Transactional
    @Override
    public void deleteUser(Long id) {
        if (userRepository.findById(id).isPresent()) {
            userRepository.deleteById(id);
        }
    }

    @Transactional
    @Override
    public void updateUser(Long id, User user) {
        Optional<User> userFromDb = userRepository.findById(id);
        if (userFromDb.isPresent()) {
            User existingUser = userFromDb.get();
            // Обновляем поля пользователя
            existingUser.setName(user.getName());
            existingUser.setAge(user.getAge());
            existingUser.setUsername(user.getUsername());
            existingUser.setRoles(user.getRoles());
            // Обновляем пароль, если он был изменен
            if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
            }
            userRepository.save(existingUser);
        }
    }

    @Override
    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
