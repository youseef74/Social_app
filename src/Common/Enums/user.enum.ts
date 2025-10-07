enum RoleEnum {
    USER = 'USER',
    ADMIN = 'ADMIN'
}

enum GenderEnum {
    MALE = 'male',
    FEMALE = 'female'
}

enum ProviderEnum {
    LOCAL = 'local',
    GOOGLE = 'google',
}

enum OTPTypeEnum {
    CONFIRMATION = 'confirmation',
    RESET_PASSWORD = 'reset_password'
}
enum friendshipStatusEnum{
    PENDING='pending',
    ACCEPTED='accepted',
    REJECTED='rejected'
}

export { RoleEnum, GenderEnum, ProviderEnum, OTPTypeEnum,friendshipStatusEnum };