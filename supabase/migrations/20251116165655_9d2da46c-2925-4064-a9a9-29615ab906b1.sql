-- Add new columns for work categorization
ALTER TABLE works 
ADD COLUMN work_type text,
ADD COLUMN work_style text,
ADD COLUMN made_with_ai boolean NOT NULL DEFAULT false;

-- Create indexes for filtering
CREATE INDEX idx_works_work_type ON works(work_type);
CREATE INDEX idx_works_work_style ON works(work_style);
CREATE INDEX idx_works_made_with_ai ON works(made_with_ai);

-- Add comment for documentation
COMMENT ON COLUMN works.work_type IS 'Type of work: 3d, 2d, photography, digital_painting, illustration, concept_art, etc.';
COMMENT ON COLUMN works.work_style IS 'Style of work: stylized, realism, cartoonish, vectorial, abstract, semi_realistic, etc.';
COMMENT ON COLUMN works.made_with_ai IS 'Indicates if AI was used in creating this work (required field)';
