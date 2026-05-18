package com.movieticket.user.service;

import com.movieticket.user.dto.request.ChangePasswordDTO;
import com.movieticket.user.dto.request.CreateEmployeeDto;
import com.movieticket.user.dto.request.EmailVerifyReq;
import com.movieticket.user.dto.request.EmployeeUpdateProfileDTO;
import com.movieticket.user.dto.request.SearchEmployeeDto;
import com.movieticket.user.dto.request.UpdateEmployeeDto;
import com.movieticket.user.dto.response.EmployeeResponseDto;
import com.movieticket.user.dto.response.EmployeeProfileDTO;
import com.movieticket.user.entity.Employee;
import com.movieticket.user.event.model.SendOTPEvent;
import com.movieticket.user.event.producer.CustomerProducer;
import com.movieticket.user.enums.EmployeeRole;
import com.movieticket.user.exception.BusinessException;
import com.movieticket.user.repository.EmployeeRepository;
import com.movieticket.user.repository.UserRepository;
import com.movieticket.user.service.strategy.create.CreateEmployeeStrategy;
import com.movieticket.user.service.strategy.create.CreateEmployeeStrategyContext;
import com.movieticket.user.service.strategy.update.UpdateEmployeeStrategy;
import com.movieticket.user.service.strategy.update.UpdateEmployeeStrategyContext;
import com.movieticket.user.utils.EmployeeUtil;
import com.movieticket.user.utils.mapper.EmployeeMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final CreateEmployeeStrategyContext strategyContext;
    private final UpdateEmployeeStrategyContext updateStrategyContext;
    private final EmployeeMapper employeeMapper;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;
    private final CustomerProducer customerProducer;
    private final JwtService jwtService;

    public Page<EmployeeResponseDto> getAllEmployees(HttpServletRequest request,
                                                     SearchEmployeeDto searchEmployeeDto,
                                                     Pageable pageable) {

        String employeeId = request.getHeader("X-User-Id");

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("Employee not found with id: " + employeeId));

        String cinemaId = searchEmployeeDto.getCinemaId();
        EmployeeRole excludeRole = null;

        if (employee.getRole() == EmployeeRole.STAFF) {
            throw new BusinessException("You do not have permission to view employees");
        }

        if (employee.getRole() == EmployeeRole.MANAGER) {
            cinemaId = employee.getCinemaId();
            searchEmployeeDto.setRole(EmployeeRole.STAFF);
        }

        if (employee.getRole() == EmployeeRole.ADMIN) {
            excludeRole = EmployeeRole.ADMIN;
        }

        Page<Employee> employees = employeeRepository.searchAllEmployees(
                excludeRole,
                cinemaId,
                searchEmployeeDto.getId(),
                searchEmployeeDto.getFullName(),
                searchEmployeeDto.getEmail(),
                searchEmployeeDto.getPhone(),
                searchEmployeeDto.getGender(),
                searchEmployeeDto.getStatus(),
                searchEmployeeDto.getRole(),
                pageable
        );

        return employees.map(EmployeeUtil::toEmployeeResponseDto);
    }

    public EmployeeResponseDto createEmployee(HttpServletRequest request, CreateEmployeeDto dto) {
        String employeeId = request.getHeader("X-User-Id");

        Employee creator = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("Employee not found"));

        validateCreateEmployee(dto);

        CreateEmployeeStrategy strategy =
                strategyContext.getStrategy(creator.getRole());

        Employee employee = strategy.create(dto, creator);

        Employee savedEmployee = employeeRepository.save(employee);

        return EmployeeUtil.toEmployeeResponseDto(savedEmployee);
    }

    public EmployeeResponseDto updateEmployee(HttpServletRequest request, String id, UpdateEmployeeDto dto) {
        String employeeId = request.getHeader("X-User-Id");

        Employee updater = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("Employee not found"));

        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Employee not found with id: " + id));

        if (existing.getId().equals(updater.getId())) {
            throw new BusinessException("Không được tự update chính mình");
        }

        if (updater.getRole() == EmployeeRole.STAFF) {
            throw new BusinessException("Bạn không có quyền update nhân viên");
        }

        if (updater.getRole() == EmployeeRole.MANAGER) {
            if (!existing.getCinemaId().equals(updater.getCinemaId())) {
                throw new BusinessException("Không cùng rạp");
            }
        }

        validateUpdateEmployee(existing, dto);

        UpdateEmployeeStrategy strategy =
                updateStrategyContext.getStrategy(updater.getRole());

        strategy.update(existing, dto);

        Employee updatedEmployee = employeeRepository.save(existing);

        if(updatedEmployee.isStatus() == false) {
            if(!jwtService.isUserIdBlackList(updatedEmployee.getId()))
                jwtService.addBlackListUserId(updatedEmployee.getId());
        }
        else {
            if(jwtService.isUserIdBlackList(updatedEmployee.getId()))
                jwtService.deleteBlackListUserId(updatedEmployee.getId());
        }

        return EmployeeUtil.toEmployeeResponseDto(updatedEmployee);
    }

    public EmployeeProfileDTO getEmployeeProfile(String employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("Employee not found with id: " + employeeId));

        return employeeMapper.toProfileDTO(employee);
    }

    @Transactional
    public EmployeeProfileDTO updateEmployeeProfile(String employeeId, EmployeeUpdateProfileDTO updateDTO) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new BusinessException("Employee not found with id: " + employeeId));

        employeeMapper.updateEmployeeProfileFromDto(updateDTO, employee);
        employee = employeeRepository.save(employee);

        return employeeMapper.toProfileDTO(employee);
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordDTO dto) {
        com.movieticket.user.dto.request.PasswordInfo info = userRepository.findPasswordInfoById(userId)
                .orElseThrow(() -> new BusinessException("Nguoi dung khong ton tai"));

        if (!passwordEncoder.matches(dto.getCurrentPassword(), info.getPassword())) {
            throw new BusinessException("Mat khau cu khong chinh xac");
        }

        userRepository.updateUserPassword(userId, passwordEncoder.encode(dto.getNewPassword()));
    }

    @Transactional(readOnly = true)
    public void requestUpdateEmail(String userId, String email) {
        if (employeeRepository.existsByEmail(email)) {
            throw new BusinessException("Email này đã tồn tại, vui lòng chọn email khác");
        }

        String redisKey = "email-update:otp:" + userId;

        Long ttl = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
        if (ttl != null && ttl > 240) {
            throw new BusinessException("Vui lòng đợi " + ttl + " giây trước khi yêu cầu mã OTP mới");
        }

        String otp = String.format("%06d", new Random().nextInt(1000000));

        redisTemplate.opsForValue().set(redisKey, otp + ":" + email, 5, TimeUnit.MINUTES);

        SendOTPEvent event = SendOTPEvent.builder()
                .userEmail(email)
                .subject("Xác nhận thay đổi Email - Alpha Cinema")
                .content(otp)
                .type("EMAIL_UPDATE")
                .build();

        customerProducer.sendOtpEmail(event);
    }

    @Transactional
    public String verifyAndUpdateEmail(String userId, EmailVerifyReq req) {
        String redisKey = "email-update:otp:" + userId;
        String data = redisTemplate.opsForValue().get(redisKey);

        if (data == null) {
            throw new BusinessException("Mã OTP đã hết hạn");
        }

        String[] parts = data.split(":");
        String savedOtp = parts[0];
        String newEmail = parts[1];

        if (!savedOtp.equals(req.getOtp())) {
            throw new BusinessException("Mã OTP không chính xác vui lòng thử lại");
        }

        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User không tồn tại"));
        employee.setEmail(newEmail);
        employeeRepository.save(employee);

        redisTemplate.delete(redisKey);
        log.info("User {} đã đổi email sang {} thành công", userId, newEmail);
        return newEmail;
    }

    private void validateUpdateEmployee(Employee existing, UpdateEmployeeDto dto) {
        if (employeeRepository.existsByEmailAndIdNot(dto.getEmail(), existing.getId())) {
                throw new BusinessException("Email đã tồn tại");
        }

        if (employeeRepository.existsByPhoneAndIdNot(dto.getPhone(), existing.getId())) {
            throw new BusinessException("SĐT đã tồn tại");
        }
    }

    private void validateCreateEmployee(CreateEmployeeDto dto) {
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email đã tồn tại");
        }

        if (employeeRepository.existsByPhone(dto.getPhone())) {
            throw new BusinessException("SĐT đã tồn tại");
        }
    }
}
