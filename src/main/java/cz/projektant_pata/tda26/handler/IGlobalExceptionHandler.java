package cz.projektant_pata.tda26.handler;

import cz.projektant_pata.tda26.dto.server.ErrorResponseDTO;
import cz.projektant_pata.tda26.exception.file.FileStorageException;
import cz.projektant_pata.tda26.exception.file.FileValidationException;
import cz.projektant_pata.tda26.exception.ResourceAlreadyExistsException;
import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

public interface IGlobalExceptionHandler {

    ResponseEntity<ErrorResponseDTO> handleNoHandlerFound(
            NoHandlerFoundException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponseDTO> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponseDTO> handleResourceAlreadyExists(
            ResourceAlreadyExistsException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponseDTO> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponseDTO> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponseDTO> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponseDTO> handleFileValidation(
            FileValidationException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponseDTO> handleMaxSizeException(
            MaxUploadSizeExceededException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponseDTO> handleFileStorage(
            FileStorageException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponseDTO> handleGlobalException(
            Exception ex, HttpServletRequest request);
}
