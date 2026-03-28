package cz.projektant_pata.tda26.repository;

import cz.projektant_pata.tda26.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TicketRepository extends JpaRepository<Ticket, UUID> {
}
