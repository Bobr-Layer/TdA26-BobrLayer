package cz.projektant_pata.tda26.handler;

import cz.projektant_pata.tda26.dto.server.ErrorResponse;
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

    ResponseEntity<ErrorResponse> handleNoHandlerFound(
            NoHandlerFoundException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponse> handleResourceAlreadyExists(
            ResourceAlreadyExistsException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponse> handleValidationErrors(
            MethodArgumentNotValidException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponse> handleTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponse> handleFileValidation(
            FileValidationException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponse> handleMaxSizeException(
            MaxUploadSizeExceededException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponse> handleFileStorage(
            FileStorageException ex, HttpServletRequest request);

    ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, HttpServletRequest request);
}
