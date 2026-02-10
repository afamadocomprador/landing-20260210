DROP VIEW IF EXISTS view_localidades_counters;

CREATE OR REPLACE VIEW view_localidades_counters AS
SELECT 
    SUBSTR(loc.codigo, 1, 2) AS provincia_codigo, -- Extraemos los 2 primeros dígitos    
    loc.codigo AS municipio_codigo,
    COUNT(*) as total_centros
FROM view_clinics c
JOIN ine_municipios loc ON (
    CASE c.city
    -- 1. CASOS CON DENOMINACIÓN BILINGÜE (Orden exacto del JSON)
    WHEN 'Elche' THEN 'Elx/Elche'
    WHEN 'Alicante' THEN 'Alacant/Alicante'
    WHEN 'Sagunto' THEN 'Sagunt/Sagunto'
    WHEN 'Valencia' THEN 'València'
    WHEN 'Castellón de la Plana' THEN 'Castelló de la Plana/Castellón de la Plana'
    WHEN 'San Sebastián' THEN 'Donostia/San Sebastián'
    WHEN 'San Vicente del Raspeig' THEN 'Sant Vicent del Raspeig/San Vicente del Raspeig'
    WHEN 'Pamplona' THEN 'Pamplona/Iruña'
    WHEN 'Villarreal' THEN 'Vila-real'
    WHEN 'Alboraya' THEN 'Alboraia/Alboraya'
    WHEN 'Alcoy' THEN 'Alcoi/Alcoy'
    WHEN 'Burlada' THEN 'Burlada/Burlata'
    WHEN 'Burriana' THEN 'Borriana/Burriana'
    WHEN 'Arrasate-Mondragón' THEN 'Arrasate/Mondragón'
    WHEN 'Estella' THEN 'Estella-Lizarra'

    WHEN 'Calafell-Segur' THEN 'Calafell'
    WHEN 'Calpe' THEN 'Calp'
    WHEN 'Cambrils-Miami' THEN 'Cambrils'
    WHEN 'Maliaño' THEN 'Camargo'
    WHEN 'Rodilana' THEN 'Medina del Campo'
    WHEN 'Sangonera la Verde' THEN 'Murcia'

    -- 2. CASOS CON DENOMINACIÓN LARGA O CAMBIO DE NOMBRE
    WHEN 'Castell-Platja d´Aro' THEN 'Castell d''Aro, Platja d''Aro i s''Agaró'
    WHEN 'Sant Carles de la Ràpita' THEN 'Ràpita, La'
    WHEN 'Palma de Mallorca' THEN 'Palma'
    WHEN 'Ibiza' THEN 'Eivissa'
    WHEN 'Jalón' THEN 'Xaló'
    WHEN 'Rafelbuñol' THEN 'Rafelbunyol'
    WHEN 'Ames - Bertamirans' THEN 'Ames'

    -- 3. ARTÍCULOS EN MINÚSCULA (Clave: tu JSON usa 'el' o 'la' en minúscula aquí)
    WHEN 'Puig' THEN 'Puig de Santa Maria, el'
    WHEN 'El Campello' THEN 'Campello, el'
    WHEN 'La Pobla de Farnals' THEN 'Pobla de Farnals, la'
    WHEN 'La Vall d´Uixó' THEN 'Vall d''Uixó, la'
    WHEN 'L´ Alcúdia' THEN 'Alcúdia, l'''
    WHEN 'L´ Alfás del Pi' THEN 'Alfàs del Pi, l'''

    -- 4. ARTÍCULOS EN MAYÚSCULA (Clave: tu JSON usa 'El', 'La' o 'A' en mayúscula aquí)
    WHEN 'A Coruña' THEN 'Coruña, A'
    WHEN 'Laracha' THEN 'Laracha, A'
    WHEN 'L´Hospitalet de Llobregat' THEN 'Hospitalet de Llobregat, L'''
    WHEN 'Las Rozas' THEN 'Rozas de Madrid, Las'
    WHEN 'Ejido (El)' THEN 'Ejido, El'
    WHEN 'El Ejido' THEN 'Ejido, El'
    WHEN 'El Almendro' THEN 'Almendro, El'
    WHEN 'El Casar' THEN 'Casar, El'
    WHEN 'El Espinar' THEN 'Espinar, El'
    WHEN 'El Masnou' THEN 'Masnou, El'
    WHEN 'El Prat de Llobregat' THEN 'Prat de Llobregat, El'
    WHEN 'El Puerto de Santa María' THEN 'Puerto de Santa María, El'
    WHEN 'El Vendrell' THEN 'Vendrell, El'
    WHEN 'El Viso del Alcor' THEN 'Viso del Alcor, El'
    WHEN 'La Bisbal d´Empordà' THEN 'Bisbal d''Empordà, La'
    WHEN 'La Carlota' THEN 'Carlota, La'
    WHEN 'La Fuente de San Esteban' THEN 'Fuente de San Esteban, La'
    WHEN 'La Línea de la Concepción' THEN 'Línea de la Concepción, La'
    WHEN 'La Orotava' THEN 'Orotava, La'
    WHEN 'La Puebla del Río' THEN 'Puebla del Río, La'
    WHEN 'La Unión' THEN 'Unión, La'
    WHEN 'La Zarza' THEN 'Zarza, La'
    WHEN 'La Zubia' THEN 'Zubia, La'
    WHEN 'Las Gabias' THEN 'Gabias, Las'
    WHEN 'Las Palmas de Gran Canaria' THEN 'Palmas de Gran Canaria, Las'
    WHEN 'Les Borges Blanques' THEN 'Borges Blanques, Les'
    WHEN 'Los Alcázares' THEN 'Alcázares, Los'
    WHEN 'Los Barrios' THEN 'Barrios, Los'
    WHEN 'Los Llanos de Aridane' THEN 'Llanos de Aridane, Los'
    WHEN 'Los Realejos' THEN 'Realejos, Los'
    WHEN 'O Barco de Valdeorras' THEN 'Barco de Valdeorras, O'
    WHEN 'O Carballiño' THEN 'Carballiño, O'
    WHEN 'O Grove' THEN 'Grove, O'
    WHEN 'O Porriño' THEN 'Porriño, O'
    WHEN 'Pontes de García Rodriguez' THEN 'Pontes de García Rodríguez, As'

    -- 5. TILDES Y CORRECCIONES MENORES
    WHEN 'Aguilas' THEN 'Águilas'
    WHEN 'Ubeda' THEN 'Úbeda'
    WHEN 'Illora' THEN 'Íllora'
    WHEN 'Iscar' THEN 'Íscar'
    WHEN 'Torre del Campo' THEN 'Torredelcampo'
    WHEN 'Salou-La Pineda' THEN 'Salou'
    WHEN 'San Cristóbal de la Laguna' THEN 'San Cristóbal de La Laguna'
    WHEN 'Sant Joan d´Alacant' THEN 'Sant Joan d''Alacant'
    WHEN 'Sant Llorenç d´Hortons' THEN 'Sant Llorenç d''Hortons'

    -- Casos que no son municipio (Maliaño, Rodilana, Sangonera) se quedan igual
    -- y el JOIN no devolverá nada, que es lo correcto para núcleos.
    ELSE c.city
END
) = loc.nombre
GROUP BY loc.codigo;-- Permisos
GRANT SELECT ON view_localidades_counters TO anon, authenticated, service_role;