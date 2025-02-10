export interface DataLog {
    action: string;
    created_at: Date;
    updated_at: Date;
    created_by: string;
    meta: string[];
}