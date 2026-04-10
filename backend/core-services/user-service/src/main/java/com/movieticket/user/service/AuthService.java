package com.movieticket.user.service;

import com.movieticket.user.dto.*;
import com.movieticket.user.entity.Customer;
import com.movieticket.user.entity.Employee;
import com.movieticket.user.entity.User;
import com.movieticket.user.enums.CustomerType;
import com.movieticket.user.enums.Gender;
import com.movieticket.user.exception.BusinessException;
import com.movieticket.user.repository.CustomerRepository;
import com.movieticket.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;


    public boolean register(RegisterRequest registerRequest){
        if(customerRepository.existsByEmail(registerRequest.getEmail())){
            throw new BusinessException("Email đã tồn tại");
        }
        if(!registerRequest.getPassword().equals(registerRequest.getPasswordConfirm())){
            throw new BusinessException("PasswordConfirm không khớp");
        }
        Customer newCustomer = new Customer(registerRequest.getFullName(), Gender.valueOf(registerRequest.getGender()),registerRequest.getEmail(), passwordEncoder.encode(registerRequest.getPassword()), true, CustomerType.MEMBER);
        customerRepository.save(newCustomer);
        return true;
    }

    public UserResponse login(LoginRequest loginRequest){
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            throw new BusinessException("Sai email hoặc mật khẩu!");
        }

        User user = userOptional.get();

        boolean isMatch = passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword()
        );

        if (!isMatch) {
            throw new BusinessException("Sai email hoặc mật khẩu!");
        }
        String role = "";
        if(user instanceof Customer){
            role = "CUSTOMER";
        }
        else{
            role = ((Employee) user).getRole().name();
        }
        return new UserResponse(user.getId(), user.getFullName(),user.getEmail(),role);
    };

    public boolean forgetPassword(ForgotPasswordRequest request){
        Optional<User> userOptional = userRepository.findByEmail(request.getEmail());
        if (userOptional.isEmpty()) {
            throw new BusinessException("Email không tồn tại !");
        }
        return true;
    }

    public boolean resetPassword(ResetPassword resetPassword){
        if(!customerRepository.existsByEmail(resetPassword.getEmail())){
            throw new BusinessException("Email đã tồn tại");
        }
        if(!resetPassword.getPassword().equals(resetPassword.getPasswordConfirm())){
            throw new BusinessException("PasswordConfirm không khớp");
        }
        User user = userRepository.findByEmail(resetPassword.getEmail()).orElse(null);
        user.setPassword(passwordEncoder.encode(resetPassword.getPassword()));
        userRepository.save(user);
        return true;
    }

}
