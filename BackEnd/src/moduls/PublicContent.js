const pool = require('../database/dbConnect');

class PublicContent {
    
    // Company Info
    static async getCompanyInfo() {
        try {
            const [result] = await pool.execute('SELECT * FROM company_info ORDER BY id DESC LIMIT 1');
            return result[0] || null;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async updateCompanyInfo(data) {
        try {
            const {
                company_name, description, email, phone, address, 
                social_media, logo_url
            } = data;

            const [existing] = await pool.execute('SELECT id FROM company_info LIMIT 1');
            
            if (existing.length > 0) {
                const [result] = await pool.execute(
                    `UPDATE company_info SET 
                     company_name = ?, description = ?, email = ?, phone = ?, 
                     address = ?, social_media = ?, logo_url = ?, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = ?`,
                    [company_name, description, email, phone, address, 
                     JSON.stringify(social_media), logo_url, existing[0].id]
                );
                return result.affectedRows;
            } else {
                const [result] = await pool.execute(
                    `INSERT INTO company_info 
                     (company_name, description, email, phone, address, social_media, logo_url) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [company_name, description, email, phone, address, 
                     JSON.stringify(social_media), logo_url]
                );
                return result.insertId;
            }
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    // Public Projects
    static async getPublicProjects(featuredOnly = false) {
        try {
            let query = 'SELECT * FROM public_projects WHERE status = "active"';
            if (featuredOnly) {
                query += ' AND featured = TRUE';
            }
            query += ' ORDER BY featured DESC, project_date DESC';
            
            const [result] = await pool.execute(query);
            return result;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    static async getAllProjects() {
        try {
            const [result] = await pool.execute('SELECT * FROM public_projects ORDER BY created_at DESC');
            return result;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    static async createProject(projectData) {
        try {
            const {
                title, description, category, image_url, client_name, project_date, featured
            } = projectData;

            const [result] = await pool.execute(
                `INSERT INTO public_projects 
                 (title, description, category, image_url, client_name, project_date, featured) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [title, description, category, image_url, client_name, project_date, featured || false]
            );
            return result.insertId;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async updateProject(id, projectData) {
        try {
            const {
                title, description, category, image_url, client_name, project_date, featured, status
            } = projectData;

            const [result] = await pool.execute(
                `UPDATE public_projects SET 
                 title = ?, description = ?, category = ?, image_url = ?, 
                 client_name = ?, project_date = ?, featured = ?, status = ?, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`,
                [title, description, category, image_url, client_name, project_date, featured, status, id]
            );
            return result.affectedRows;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async deleteProject(id) {
        try {
            const [result] = await pool.execute('DELETE FROM public_projects WHERE id = ?', [id]);
            return result.affectedRows;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    // Testimonials
    static async getTestimonials(featuredOnly = false) {
        try {
            let query = 'SELECT * FROM testimonials WHERE status = "active"';
            if (featuredOnly) {
                query += ' AND featured = TRUE';
            }
            query += ' ORDER BY featured DESC, created_at DESC';
            
            const [result] = await pool.execute(query);
            return result;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    static async getAllTestimonials() {
        try {
            const [result] = await pool.execute('SELECT * FROM testimonials ORDER BY created_at DESC');
            return result;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    static async createTestimonial(testimonialData) {
        try {
            const {
                client_name, client_image, content, rating, project_type, featured
            } = testimonialData;

            const [result] = await pool.execute(
                `INSERT INTO testimonials 
                 (client_name, client_image, content, rating, project_type, featured) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [client_name, client_image, content, rating, project_type, featured || false]
            );
            return result.insertId;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async updateTestimonial(id, testimonialData) {
        try {
            const {
                client_name, client_image, content, rating, project_type, featured, status
            } = testimonialData;

            const [result] = await pool.execute(
                `UPDATE testimonials SET 
                 client_name = ?, client_image = ?, content = ?, rating = ?, 
                 project_type = ?, featured = ?, status = ? 
                 WHERE id = ?`,
                [client_name, client_image, content, rating, project_type, featured, status, id]
            );
            return result.affectedRows;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async deleteTestimonial(id) {
        try {
            const [result] = await pool.execute('DELETE FROM testimonials WHERE id = ?', [id]);
            return result.affectedRows;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    // FAQs
    static async getFAQs() {
        try {
            const [result] = await pool.execute(
                'SELECT * FROM faqs WHERE status = "active" ORDER BY order_index, id DESC'
            );
            return result;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    static async getAllFAQs() {
        try {
            const [result] = await pool.execute('SELECT * FROM faqs ORDER BY order_index, id DESC');
            return result;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    static async createFAQ(faqData) {
        try {
            const { question, answer, category, order_index } = faqData;

            const [result] = await pool.execute(
                'INSERT INTO faqs (question, answer, category, order_index) VALUES (?, ?, ?, ?)',
                [question, answer, category, order_index || 0]
            );
            return result.insertId;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async updateFAQ(id, faqData) {
        try {
            const { question, answer, category, order_index, status } = faqData;

            const [result] = await pool.execute(
                `UPDATE faqs SET 
                 question = ?, answer = ?, category = ?, order_index = ?, status = ? 
                 WHERE id = ?`,
                [question, answer, category, order_index, status, id]
            );
            return result.affectedRows;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async deleteFAQ(id) {
        try {
            const [result] = await pool.execute('DELETE FROM faqs WHERE id = ?', [id]);
            return result.affectedRows;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    // Service Policies
    static async getServicePolicies() {
        try {
            const [result] = await pool.execute(
                'SELECT * FROM service_policies WHERE status = "active" ORDER BY order_index, id DESC'
            );
            return result;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    static async getAllServicePolicies() {
        try {
            const [result] = await pool.execute('SELECT * FROM service_policies ORDER BY order_index, id DESC');
            return result;
        } catch (err) {
            console.log(err);
            return [];
        }
    }

    static async createServicePolicy(policyData) {
        try {
            const { title, content, policy_type, order_index } = policyData;

            const [result] = await pool.execute(
                'INSERT INTO service_policies (title, content, policy_type, order_index) VALUES (?, ?, ?, ?)',
                [title, content, policy_type, order_index || 0]
            );
            return result.insertId;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async updateServicePolicy(id, policyData) {
        try {
            const { title, content, policy_type, order_index, status } = policyData;

            const [result] = await pool.execute(
                `UPDATE service_policies SET 
                 title = ?, content = ?, policy_type = ?, order_index = ?, status = ? 
                 WHERE id = ?`,
                [title, content, policy_type, order_index, status, id]
            );
            return result.affectedRows;
        } catch (err) {
            console.log(err);
            return null;
        }
    }

    static async deleteServicePolicy(id) {
        try {
            const [result] = await pool.execute('DELETE FROM service_policies WHERE id = ?', [id]);
            return result.affectedRows;
        } catch (err) {
            console.log(err);
            return null;
        }
    }
}

module.exports = PublicContent;