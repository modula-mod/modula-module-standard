from __future__ import annotations

REQUIRED_PERMISSIONS = (
	'profile.read',
)


def validate_declared_permissions(permissions: list[str] | tuple[str, ...]) -> dict:
	declared = {str(item).strip() for item in permissions if str(item).strip()}
	required = set(REQUIRED_PERMISSIONS)
	missing = sorted(required - declared)
	unknown = sorted(declared - required)
	return {
		'valid': not missing and not unknown,
		'missing': missing,
		'unknown': unknown,
		'required': list(REQUIRED_PERMISSIONS),
	}
