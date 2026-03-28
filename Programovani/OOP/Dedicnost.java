package Programovani.OOP;

import java.util.Objects;

public class Dedicnost {
    public static void main(String[] args) {
        Animal[] zoo = new Animal[] {
                new Dog("Rex", 5),
                new Cat("Micka", "laser"),
                new Dog("Rex", 5), // stejná data jako první pes
                new Cat("Mourek", "klubko")
        };

        // Polymorfismus: volá se přepsaná verze speak() podle skutečného typu objektu
        for (Animal a : zoo) {
            System.out.println(a); // toString()
            a.speak(); // override v Dog/Cat
            System.out.println("hashCode: " + a.hashCode());
            System.out.println();
        }

        // Ukázka equals: první a třetí prvek jsou rovné (oba Dog("Rex", 5))
        System.out.println("zoo[0].equals(zoo[2]) ? " + zoo[0].equals(zoo[2]));

        // A rozdílné typy nejsou rovné, i kdyby měly stejné jméno
        System.out.println("new Dog(\"Micka\",1).equals(new Cat(\"Micka\",\"laser\")) ? "
                + new Dog("Micka", 1).equals(new Cat("Micka", "laser")));
    }
}

/** Předek (konkrétní třída) */
class Animal {
    private final String name;

    public Animal(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Jméno nesmí být prázdné.");
        }
        this.name = name.trim();
    }

    public String getName() {
        return name;
    }

    /** „Běžná“ metoda – potomci ji přepíšou (override) vlastní verzí. */
    public void speak() {
        System.out.println(name + " vydává neurčitý zvuk.");
    }

    /** toString – stručná textová reprezentace (včetně typu) */
    @Override
    public String toString() {
        return getClass().getSimpleName() + "{name='" + name + "'}";
    }

    /**
     * equals – porovnáváme přesně stejnou třídu (getClass), aby byl zachován
     * kontrakt symetrie mezi různými potomky. Potomci pak rozšíří porovnání o své
     * pole.
     */
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false; // přesná shoda třídy
        Animal animal = (Animal) o;
        return Objects.equals(name, animal.name);
    }

    /**
     * hashCode – zahrneme i třídu (nepřímo přes super.hashCode v potomcích),
     * aby různé typy se stejným jménem negenerovaly stejné kódy náhodou.
     */
    @Override
    public int hashCode() {
        // zahrnutí názvu třídy zvyšuje odlišení mezi potomky
        return Objects.hash(getClass(), name);
    }
}

/** Potomek: pes má navíc věk */
class Dog extends Animal {
    private final int age;

    public Dog(String name, int age) {
        super(name);
        if (age < 0)
            throw new IllegalArgumentException("Věk nesmí být záporný.");
        this.age = age;
    }

    public int getAge() {
        return age;
    }

    @Override
    public void speak() {
        System.out.println(getName() + ": Haf!");
    }

    @Override
    public String toString() {
        return super.toString().replace("}", ", age=" + age + "}");
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        // nejprve přesný typ
        if (o == null || getClass() != o.getClass())
            return false;
        // super.equals už ověřil jméno a typ
        if (!super.equals(o))
            return false;
        Dog dog = (Dog) o;
        return age == dog.age;
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), age);
    }
}

/** Potomek: kočka má oblíbenou hračku */
class Cat extends Animal {
    private final String favoriteToy;

    public Cat(String name, String favoriteToy) {
        super(name);
        this.favoriteToy = favoriteToy == null ? "" : favoriteToy.trim();
    }

    public String getFavoriteToy() {
        return favoriteToy;
    }

    @Override
    public void speak() {
        System.out.println(getName() + ": Mňau!");
    }

    @Override
    public String toString() {
        return super.toString().replace("}", ", favoriteToy='" + favoriteToy + "'}");
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        // přesná shoda třídy
        if (o == null || getClass() != o.getClass())
            return false;
        if (!super.equals(o))
            return false;
        Cat cat = (Cat) o;
        return Objects.equals(favoriteToy, cat.favoriteToy);
    }

    @Override
    public int hashCode() {
        return Objects.hash(super.hashCode(), favoriteToy);
    }
}