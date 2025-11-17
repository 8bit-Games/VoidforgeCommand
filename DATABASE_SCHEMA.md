# 8-Bit Arcade Database Schema

This document provides a detailed overview of the 8-Bit Arcade platform's database schema. It is intended for developers building games or services that interact with our platform. The schema is defined using Prisma and organized into several logical schemas, each representing a different functional area.

## Table of Contents

- [Core Schemas](#core-schemas)
- [Schema Details](#schema-details)
  - [Auth Schema](#auth-schema)
  - [Users Schema](#users-schema)
  - [Gaming Schema](#gaming-schema)
  - [Social Schema](#social-schema)
  - [Marketplace Schema](#marketplace-schema)
  - [Community Schema](#community-schema)
  - [Analytics Schema](#analytics-schema)
  - [Arcade Schema](#arcade-schema)
- [Enums](#enums)

## Core Schemas

The database is divided into the following schemas for better organization:

- **`auth`**: Handles user authentication, accounts, sessions, and security-related logs.
- **`users`**: Manages user profiles, preferences, and other user-centric data.
- **`gaming`**: Contains all game-related data, including game information, user stats, achievements, and game highlights.
- **`social`**: Powers the social features of the platform, such as friendships, chat, and social feeds.
- **`marketplace`**: Manages NFTs, collections, and transactions on the marketplace.
- **`community`**: Supports community engagement features like dev logs, events, polls, and forums.
- **`analytics`**: Stores data for analytics, monitoring, and error tracking.
- **`arcade`**: Contains models specific to the arcade experience, like high scores, profiles, and events.

---

## Schema Details

### Auth Schema

#### `User`

Stores core user information for authentication and identification.

| Field                 | Type        | Description                                                                 |
| --------------------- | ----------- | --------------------------------------------------------------------------- |
| `id`                  | `Int`       | Unique identifier for the user.                                             |
| `username`            | `String`    | Unique username.                                                            |
| `email`               | `String`    | Unique email address.                                                       |
| `passwordHash`        | `String?`   | Hashed password for the user.                                               |
| `createdAt`           | `DateTime`  | Timestamp of when the user was created.                                     |
| `lastLogin`           | `DateTime?` | Timestamp of the last login.                                                |
| `isActive`            | `Boolean`   | Whether the user account is active.                                         |
| `role`                | `UserRole`  | The role of the user (e.g., `USER`, `ADMIN`).                               |
| ...                   | ...         | Other fields for profile, settings, and relations.                          |

#### `SmartAccount`

Links a user to a smart wallet account.

| Field     | Type       | Description                               |
| --------- | ---------- | ----------------------------------------- |
| `id`      | `Int`      | Unique identifier.                        |
| `userId`  | `Int`      | Foreign key to the `User` model.          |
| `address` | `String`   | The smart wallet address.                 |
| `createdAt` | `DateTime` | Timestamp of when the account was linked. |

#### `AuthHistory`

Logs authentication attempts for users.

| Field            | Type          | Description                               |
| ---------------- | ------------- | ----------------------------------------- |
| `id`             | `Int`         | Unique identifier.                        |
| `userId`         | `Int`         | Foreign key to the `User` model.          |
| `loginTimestamp` | `DateTime`    | Timestamp of the login attempt.           |
| `loginStatus`    | `LoginStatus` | The status of the login attempt.          |
| `loginMethod`    | `LoginMethod` | The method used for login.                |

---

### Users Schema

#### `UserProfile`

Stores detailed profile information for a user.

| Field               | Type        | Description                               |
| ------------------- | ----------- | ----------------------------------------- |
| `id`                | `Int`       | Unique identifier.                        |
| `userId`            | `Int`       | Foreign key to the `User` model.          |
| `bio`               | `String?`   | User's biography.                         |
| `profilePictureUrl` | `String?`   | URL for the user's profile picture.       |
| `location`          | `String?`   | User's location.                          |
| `website`           | `String?`   | User's personal website.                  |

#### `UserPreference`

Stores user-specific preferences.

| Field                  | Type      | Description                               |
| ---------------------- | --------- | ----------------------------------------- |
| `id`                   | `Int`     | Unique identifier.                        |
| `userId`               | `Int`     | Foreign key to the `User` model.          |
| `notificationSettings` | `Json?`   | JSON object for notification settings.    |
| `theme`                | `String?` | The user's preferred theme.               |
| `language`             | `String?` | The user's preferred language.            |

---

### Gaming Schema

#### `Game`

Represents a game on the platform.

| Field              | Type         | Description                               |
| ------------------ | ------------ | ----------------------------------------- |
| `id`               | `Int`        | Unique identifier.                        |
| `creatorId`        | `Int?`       | Foreign key to the `User` who created it. |
| `sanityId`         | `String`     | Unique ID from Sanity CMS.                |
| `title`            | `String`     | The title of the game.                    |
| `slug`             | `String`     | URL-friendly slug for the game.           |
| `description`      | `String?`    | A detailed description of the game.       |
| `genre`            | `String[]`   | Array of genres for the game.             |
| `platform`         | `String[]`   | Array of supported platforms.             |
| `releaseDate`      | `DateTime?`  | The release date of the game.             |

#### `UserGameStat`

Stores game-specific statistics for a user.

| Field        | Type       | Description                               |
| ------------ | ---------- | ----------------------------------------- |
| `id`         | `Int`      | Unique identifier.                        |
| `userId`     | `Int`      | Foreign key to the `User` model.          |
| `gameId`     | `Int`      | Foreign key to the `Game` model.          |
| `playTime`   | `Int`      | Total playtime in seconds.                |
| `highScore`  | `Int`      | The user's high score in the game.        |
| `lastPlayed` | `DateTime` | Timestamp of when the game was last played. |

#### `GameHighlight`

Represents a user-created game highlight or clip.

| Field       | Type                | Description                               |
| ----------- | ------------------- | ----------------------------------------- |
| `id`        | `Int`               | Unique identifier.                        |
| `title`     | `String`            | The title of the highlight.               |
| `mediaAssetId` | `Int`            | Foreign key to the `MediaAsset` model.    |
| `gameId`    | `Int`               | Foreign key to the `Game` model.          |
| `userId`    | `Int`               | Foreign key to the `User` model.          |
| `category`  | `HighlightCategory` | The category of the highlight.            |
| `views`     | `Int`               | The number of views.                      |

---

### Arcade Schema

#### `GameSession`

Represents a single gameplay session in the arcade.

| Field       | Type       | Description                               |
| ----------- | ---------- | ----------------------------------------- |
| `id`        | `Int`      | Unique identifier.                        |
| `userId`    | `Int`      | Foreign key to the `User` model.          |
| `gameId`    | `Int`      | Foreign key to the `Game` model.          |
| `score`     | `Int`      | The score achieved in the session.        |
| `duration`  | `Int`      | The duration of the session in seconds.   |
| `createdAt` | `DateTime` | Timestamp of when the session was created.|

#### `ArcadeHighScore`

Stores the high scores for arcade games.

| Field     | Type       | Description                               |
| --------- | ---------- | ----------------------------------------- |
| `id`      | `Int`      | Unique identifier.                        |
| `userId`  | `Int`      | Foreign key to the `User` model.          |
| `gameId`  | `Int`      | Foreign key to the `Game` model.          |
| `score`   | `Int`      | The high score.                           |
| `timestamp` | `DateTime` | Timestamp of when the high score was set. |

#### `ArcadeProfile`

Manages a user's profile within the arcade.

| Field        | Type       | Description                               |
| ------------ | ---------- | ----------------------------------------- |
| `id`         | `Int`      | Unique identifier.                        |
| `userId`     | `Int`      | Foreign key to the `User` model.          |
| `level`      | `Int`      | The user's arcade level.                  |
| `experience` | `Int`      | The user's experience points.             |
| `coins`      | `Int`      | The number of coins the user has.         |
| `tickets`    | `Int`      | The number of tickets the user has.       |

---

## Enums

This section lists the enums used throughout the schema.

- **`LoginStatus`**: `SUCCESS`, `FAILED`, `LOCKED_OUT`
- **`LoginMethod`**: `PASSWORD`, `OAUTH`, `TWO_FACTOR`, `MAGIC_LINK`, `TELEGRAM`, `DISCORD`, `WECHAT`
- **`UserRole`**: `USER`, `ADMIN`, `MODERATOR`
- **`UserStatus`**: `ACTIVE`, `PENDING`, `SUSPENDED`, `BANNED`, `DELETED`
- **`MediaType`**: `IMAGE`, `VIDEO`, `AUDIO`, `DOCUMENT`, `MODEL_3D`, `ANIMATION`, `GAME_HIGHLIGHT`, `GAME_REPLAY`
- **`HighlightCategory`**: `FUNNY`, `SKILLPLAY`, `SPEEDRUN`, `GLITCH`, `TUTORIAL`, `ACHIEVEMENT`, `EASTER_EGG`, `GAMEPLAY`, `STORY`, `CUSTOM`
- **`EventStatus`**: `SCHEDULED`, `ACTIVE`, `COMPLETED`, `CANCELLED`, `DELAYED`
- **`EventRewardType`**: `EARNED`, `REDEEMED`, `LOGIN`, `STREAK`, `AD`, `REFERRAL`, `QUEST`, `OTHER`

... and more. Refer to the `schema.prisma` file for a complete list of enums.
