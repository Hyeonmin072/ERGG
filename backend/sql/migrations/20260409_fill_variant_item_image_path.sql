-- 접미사 변형 아이템(-새벽, -진홍) 이미지 경로 보정
-- 예: 더 데스-진홍 -> 더 데스 의 image_path 복사

WITH base_image AS (
    SELECT
        v.id AS variant_id,
        b.image_path AS base_image_path
    FROM item v
    JOIN item b
      ON b.type = v.type
     AND b.name_kr = regexp_replace(v.name_kr, '-(새벽|진홍)$', '')
    WHERE
        v.type = 'weapon'
        AND v.name_kr ~ '-(새벽|진홍)$'
        AND b.image_path IS NOT NULL
        AND b.image_path <> ''
)
UPDATE item i
SET
    image_path = base_image.base_image_path,
    "updatedAt" = NOW()
FROM base_image
WHERE i.id = base_image.variant_id
  AND COALESCE(i.image_path, '') <> base_image.base_image_path;
