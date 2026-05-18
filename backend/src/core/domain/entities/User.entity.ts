export enum UserRole {
  ADMIN = 'admin',
  VIEWER = 'viewer',
  ANALYST = 'analyst',
}

export class UserEntity {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly name: string,
    public readonly role: UserRole,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
    public readonly lastLogin?: Date,
    public readonly isActive: boolean = true,
  ) {}

  static create(email: string, passwordHash: string, name: string, role: UserRole = UserRole.VIEWER): UserEntity {
    return new UserEntity(
      crypto.randomUUID(),
      email,
      passwordHash,
      name,
      role,
      new Date(),
      new Date(),
      undefined,
      true,
    );
  }

  toSafeJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin,
      isActive: this.isActive,
    };
  }
}