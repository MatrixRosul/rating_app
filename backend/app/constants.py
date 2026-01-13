"""
Application constants for backend
Following best practices: STRING in DB, constants in code
"""

# ============================================
# USER ROLES
# ============================================
class ROLES:
    """User role constants"""
    GUEST = "guest"
    PLAYER = "player"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"
    
    @classmethod
    def all(cls):
        return [cls.GUEST, cls.PLAYER, cls.ADMIN, cls.SUPER_ADMIN]
    
    @classmethod
    def is_valid(cls, role: str) -> bool:
        return role in cls.all()


# ============================================
# TOURNAMENT STATUS
# ============================================
class TOURNAMENT_STATUS:
    """Tournament status constants"""
    REGISTRATION = "registration"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"
    DRAFT = "draft"  # For future use
    CANCELED = "canceled"  # For future use
    
    @classmethod
    def all(cls):
        return [cls.REGISTRATION, cls.IN_PROGRESS, cls.FINISHED, cls.DRAFT, cls.CANCELED]
    
    @classmethod
    def is_valid(cls, status: str) -> bool:
        return status in cls.all()


# ============================================
# DISCIPLINES
# ============================================
class DISCIPLINES:
    """Game discipline constants"""
    FREE_PYRAMID = "free_pyramid"
    FREE_PYRAMID_EXTENDED = "free_pyramid_extended"
    COMBINED_PYRAMID = "combined_pyramid"
    DYNAMIC_PYRAMID = "dynamic_pyramid"
    COMBINED_PYRAMID_CHANGES = "combined_pyramid_changes"
    
    @classmethod
    def all(cls):
        return [
            cls.FREE_PYRAMID,
            cls.FREE_PYRAMID_EXTENDED,
            cls.COMBINED_PYRAMID,
            cls.DYNAMIC_PYRAMID,
            cls.COMBINED_PYRAMID_CHANGES
        ]
    
    @classmethod
    def is_valid(cls, discipline: str) -> bool:
        return discipline in cls.all()


# ============================================
# BRACKET TYPES
# ============================================
class BRACKET_TYPES:
    """Tournament bracket type constants"""
    SINGLE_ELIMINATION = "single_elimination"
    DOUBLE_ELIMINATION = "double_elimination"
    GROUP_STAGE = "group_stage"
    
    @classmethod
    def all(cls):
        return [cls.SINGLE_ELIMINATION, cls.DOUBLE_ELIMINATION, cls.GROUP_STAGE]
    
    @classmethod
    def is_valid(cls, bracket_type: str) -> bool:
        return bracket_type in cls.all()


# ============================================
# MATCH STATUS
# ============================================
class MATCH_STATUS:
    """Match status constants"""
    SCHEDULED = "scheduled"  # Previously "pending"
    PENDING = "pending"  # Alias for backward compatibility
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"  # Previously "finished"
    FINISHED = "finished"  # Alias for backward compatibility
    CANCELLED = "cancelled"
    
    @classmethod
    def all(cls):
        return [cls.SCHEDULED, cls.IN_PROGRESS, cls.COMPLETED, cls.CANCELLED]
    
    @classmethod
    def is_valid(cls, status: str) -> bool:
        return status in cls.all() or status in [cls.PENDING, cls.FINISHED]


# ============================================
# REGISTRATION STATUS
# ============================================
class REGISTRATION_STATUS:
    """Tournament registration status constants"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    
    @classmethod
    def all(cls):
        return [cls.PENDING, cls.CONFIRMED, cls.REJECTED, cls.WITHDRAWN]
    
    @classmethod
    def is_valid(cls, status: str) -> bool:
        return status in cls.all()


# ============================================
# DEFAULT VALUES
# ============================================
DEFAULT_RATING = 1300.0
DEFAULT_COUNTRY = "Україна"
