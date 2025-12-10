// cz/projektant_pata/tda26/exception/FileStorageException.java
package cz.projektant_pata.tda26.exception;

public class FileStorageException extends RuntimeException {
    public FileStorageException(String message) {
        super(message);
    }
    public FileStorageException(String message, Throwable cause) {
        super(message, cause);
    }
}
