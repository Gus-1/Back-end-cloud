DROP TABLE IF EXISTS address CASCADE;
CREATE TABLE address (
                         addressId integer primary key GENERATED ALWAYS AS IDENTITY,
                         street varchar not null,
                         number integer not null,
                         city varchar not null,
                         postalCode integer not null,
                         country varchar not null
);

DROP TABLE IF EXISTS gameCategory CASCADE;
CREATE TABLE gameCategory (
                              gameCategoryId integer primary key GENERATED ALWAYS AS IDENTITY,
                              label varchar not null,
                              description varchar not null
);

DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
                       userId integer primary key GENERATED ALWAYS AS IDENTITY,
                       firstName varchar not null,
                       name varchar not null,
                       birthDate date not null,
                       isAdmin boolean not null,
                       email varchar unique not null,
                       password varchar not null,
                       photoPath varchar not null
);

DROP TABLE IF EXISTS event CASCADE;
CREATE TABLE event (
                       eventId integer primary key GENERATED ALWAYS AS IDENTITY,
                       creatorId integer REFERENCES users(userId) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
                       gameCategoryId integer REFERENCES gameCategory(gameCategoryId) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
                       creationDate date not null,
                       eventDate date not null,
                       place integer REFERENCES address(addressId) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE,
                       eventDescription varchar not null,
                       isVerified boolean not null,
                       nbMaxPlayer integer not null,
                       adminMessage varchar
);

DROP TABLE IF EXISTS inscription CASCADE;
CREATE TABLE inscription(
                            inscriptionId integer primary key GENERATED ALWAYS AS IDENTITY,
                            eventId integer REFERENCES event(eventId) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE not null,
                            userId integer REFERENCES users(userId) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE not null
);

DROP TABLE IF EXISTS message CASCADE;
CREATE TABLE message(
                        messageId integer primary key GENERATED ALWAYS AS IDENTITY,
                        sendId integer REFERENCES users(userid) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE not null,
                        eventId integer REFERENCES users(userid) ON DELETE CASCADE DEFERRABLE INITIALLY IMMEDIATE not null ,
                        content varchar not null,
                        date varchar not null
);

INSERT INTO address (street, number, city, postalCode, country) values ('Rue Saint Remy', 4, 'Fosses-la-ville', 5070, 'Belgium');
INSERT INTO address (street, number, city, postalCode, country) values ('Rue Joseph Calozet', 19, 'Namur', 5000, 'Belgium');
INSERT INTO address (street, number, city, postalCode, country) values ('Rue du grand babin', 5, 'Malonne', 5010, 'Belgium'); -- V??rifier ces informations
INSERT INTO address (street, number, city, postalCode, country) values ('Rue de Bruxelles', 10, 'Namur', 5000, 'Belgium');
INSERT INTO address (street, number, city, postalCode, country) values ('Rue des croisiers', 12, 'Namur', 5000, 'Belgium');
INSERT INTO address (street, number, city, postalCode, country) values ('Rue Godefroid', 7, 'Namur', 5000, 'Belgium');


INSERT INTO gameCategory (label, description) values ('RPG', 'ROLE PLAY GAMES');
INSERT INTO gameCategory (label, description) values ('Board Games', 'Board games');
INSERT INTO gameCategory (label, description) values ('Solo Games', 'Games that can be play alone');
INSERT INTO gameCategory (label, description) values ('Deck Builder', 'Card game');
INSERT INTO gameCategory (label, description) values ('Dungeon crawler', 'Dungeon crawler');
INSERT INTO gameCategory (label, description) values ('Wargame', 'Type: Warhammer 40000, Risk, ...');

INSERT INTO users (firstName, name, birthDate, isAdmin, email, password, photoPath)
    values ('Christophe', 'Bernard', '2001-02-20', 'true', 'f@f',
    '$2b$10$dGDvoKk29sETHESXK0H54eG/xwu2dWJL8NnAQWMEeKkrceitKyXou', 'c:/photos/1');
INSERT INTO users (firstName, name, birthDate, isAdmin, email, password, photoPath)
    values ('Maxence', 'Delbrouck', '1999-10-25', 'false', 'maxence.n@gmail.com',
    '$2b$10$i0/Qwo7dASF.VgZd666AHepuJva8hKrabYG6RnQh8JVhD6dhwwmq2', 'c:/photos/2');
INSERT INTO users (firstName, name, birthDate, isAdmin, email, password, photoPath)
values ('Valentin', 'Delmoiti??', '2000-09-20', 'false', 'valentin.delmoiti??@gmail.com',
        '$2b$10$yG.bchceSHPEJiMYy9CS4OpwKfvDxqUw.laBjIYgZdE6SA12a0BaG', 'c:/photos/3');
INSERT INTO users (firstName, name, birthDate, isAdmin, email, password, photoPath)
values ('Arnaud', 'Papp', '1994-05-29', 'false', 'arnaud.papp@gmail.com',
        '$2b$10$0.RcdiGJVWFXUJib9WweeuXJV8EW7yMwX71q643ndOUXxr2BNa0Dq', 'c:/photos/4');
INSERT INTO users (firstName, name, birthDate, isAdmin, email, password, photoPath)
values ('Evan', 'Colle', '1994-05-29', 'false', 'evan.colle@gmail.com',
        '$2b$10$0.RcdiGJVWFXUJib9WweeuXJV8EW7yMwX71q643ndOUXxr2BNa0Dq', 'c:/photos/4');

INSERT INTO event (creatorId, gameCategoryId, creationDate, eventDate, place, eventDescription, isVerified, nbMaxPlayer)
    values (1, 3, NOW(), NOW() + interval '1 day' ,2, 'Soir??e seul', 'true', 1);
INSERT INTO event (creatorId, gameCategoryId, creationDate, eventDate, place, eventDescription, isVerified, nbMaxPlayer)
    values (1, 4, NOW(), NOW() + interval '4 day' ,1, 'Soir??e Yu Gi Oh', 'false', 8);
INSERT INTO event (creatorId, gameCategoryId, creationDate, eventDate, place, eventDescription, isVerified, nbMaxPlayer)
    values (2, 6, NOW(), NOW() + interval '8 day' ,3, 'Principalement Risk', 'false', 12);
INSERT INTO event (creatorId, gameCategoryId, creationDate, eventDate, place, eventDescription, isVerified, nbMaxPlayer)
    values (3, 1, NOW(), NOW() + interval '10 hour' ,4, 'Principalement Munchkin', 'true', 6);
INSERT INTO event (creatorId, gameCategoryId, creationDate, eventDate, place, eventDescription, isVerified, nbMaxPlayer)
    values (4, 2, NOW(), NOW() + interval '30 hour' ,5, 'On fait des trucs', 'false', 15);
INSERT INTO event (creatorId, gameCategoryId, creationDate, eventDate, place, eventDescription, isVerified, nbMaxPlayer)
    values (5, 2, NOW(), NOW() + interval '40 hour' ,6, 'On fait plus de trucs', 'true', 8);

--Ajout des personnes ayant cr???? l'??v??nement
INSERT INTO inscription (eventId, userId) values (1, 1);
INSERT INTO inscription (eventId, userId) values (2, 1);
INSERT INTO inscription (eventId, userId) values (3, 2);
INSERT INTO inscription (eventId, userId) values (4, 3);
INSERT INTO inscription (eventId, userId) values (5, 4);
INSERT INTO inscription (eventId, userId) Values (6, 5);
--Ajout des personnes suppl??mentaires
INSERT INTO inscription(eventId, userId) values (2, 4);
INSERT INTO inscription(eventId, userId) values (3, 3);
INSERT INTO inscription(eventId, userId) values (4, 4);
INSERT INTO inscription(eventId, userId) values (4, 2);

INSERT INTO message (sendId, eventId, content, date) VALUES (2, 1, 'Premier message de test', NOW());

