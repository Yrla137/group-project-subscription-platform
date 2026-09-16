-- DATABASE TABLES POSTGRESQL

-- TIERS TABLE
-- Must be created before users because users references tiers.
CREATE TABLE tiers (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    tier_description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    level_number INT NOT NULL UNIQUE,
    max_todos_per_day INT NOT NULL,
    max_future_days INT NOT NULL,
    max_custom_habits INT NOT NULL
);

-- USERS TABLE
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    role VARCHAR(20) NOT NULL DEFAULT 'member'
        CHECK (role IN ('member', 'administrator')),

    current_tier_id INT NOT NULL DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (current_tier_id) REFERENCES tiers(id)
);

-- PAYMENTS TABLE
CREATE TABLE payments (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    tier_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (tier_id) REFERENCES tiers(id)
);

Uppdaterad tasks - de tidigare tabellernas SQL finns sparade utifall att något går fel.
-- TASKS TABLE
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    task_title VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_date DATE NOT NULL,          -- Datumet då tasken ska utföras
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- HABITS TABLE
-- Must be created before user_habits because user_habits references habits.
CREATE TABLE habits (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    habit_title VARCHAR(255) NOT NULL,
    habit_description TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- USER HABITS TABLE
CREATE TABLE user_habits (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT NOT NULL,
    habit_id INT NOT NULL,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (habit_id) REFERENCES habits(id)
);

-- SEMINARS TABLE
CREATE TABLE seminars (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    seminar_title VARCHAR(255) NOT NULL,
    seminar_description TEXT,
    seminar_date TIMESTAMP NOT NULL,
    tier_id INT NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (tier_id) REFERENCES tiers(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

