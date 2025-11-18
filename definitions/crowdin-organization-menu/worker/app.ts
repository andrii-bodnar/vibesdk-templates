import * as crowdinModule from '@crowdin/app-project-module';
import { ProjectsGroupsModel, ResponseObject } from '@crowdin/crowdin-api-client';
import { AssetsConfig, FileStore } from '@crowdin/app-project-module/out/types';
import { D1StorageConfig } from '@crowdin/app-project-module/out/storage/d1';
import { Request, Response } from 'express';

export function createApp({
    clientId,
    clientSecret,
    assetsConfig,
    d1Config,
    fileStore
}: {
    clientId: string;
    clientSecret: string;
    assetsConfig: AssetsConfig;
    d1Config: D1StorageConfig;
    fileStore: FileStore;
}) {
    const app = crowdinModule.express();

    const configuration = {
        name: "Organization Menu App",
        identifier: "organization-menu-app",
        description: "A Crowdin app built with the SDK with Organization Menu module",
        clientId,
        clientSecret,
        disableLogsFormatter: true,
        assetsConfig,
        d1Config,
        fileStore,
        imagePath: '/logo.png',
        
        // API scopes - define what your app can access
        scopes: [
            crowdinModule.Scope.PROJECTS,        // Project management
            crowdinModule.Scope.GROUPS,          // Group management
            // Add other scopes as needed
        ],
        
        // Organization Menu module configuration
        organizationMenu: {
            fileName: 'index.html',
            uiPath: '/organization-menu'
        }
    };

    // Initialize Crowdin app
    const crowdinApp = crowdinModule.addCrowdinEndpoints(app, configuration);

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });

    // Get projects organized by groups
    app.get('/api/projects-by-groups', async (req: Request, res: Response) => {
        try {
            const jwt = req.query.jwt as string;
            if (!jwt) {
                return res.status(400).json({ success: false, error: 'JWT token is required' });
            }

            if (!crowdinApp.establishCrowdinConnection) {
                return res.status(500).json({ success: false, error: 'Crowdin connection method not available' });
            }

            const connection = await crowdinApp.establishCrowdinConnection(jwt, undefined);

            if (!connection.client) {
                return res.status(500).json({ success: false, error: 'Crowdin API client not available' });
            }

            type Group = {
                id: number;
                name: string;
                description: string;
                projects: Project[];
            };

            type Project = {
                id: number;
                name: string;
                groupId: number;
            };

            // Get all groups
            const groupsResponse = await connection.client.projectsGroupsApi.withFetchAll().listGroups();
            const groups: Group[] = groupsResponse.data.map((item: ResponseObject<ProjectsGroupsModel.Group>) => ({
                id: item.data.id,
                name: item.data.name,
                description: item.data.description || '',
                projects: []
            }));

            // Get all projects
            const projectsResponse = await connection.client.projectsGroupsApi.withFetchAll().listProjects();
            const allProjects: Project[] = projectsResponse.data.map((item: ResponseObject<ProjectsGroupsModel.Project>) => ({
                id: item.data.id,
                name: item.data.name,
                groupId: item.data.groupId
            }));

            // Organize projects by groups
            const ungroupedProjects: Project[] = [];
            
            allProjects.forEach((project: Project) => {
                if (project.groupId) {
                    const group = groups.find((g: Group) => g.id === project.groupId);
                    if (group) {
                        group.projects.push(project);
                    } else {
                        ungroupedProjects.push(project);
                    }
                } else {
                    ungroupedProjects.push(project);
                }
            });

            res.status(200).json({ 
                success: true, 
                data: {
                    groups: groups,
                    ungroupedProjects: ungroupedProjects,
                    totalGroups: groups.length,
                    totalProjects: allProjects.length
                }
            });
        } catch (error) {
            console.error('Error fetching projects by groups:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch projects by groups' 
            });
        }
    });

    return { expressApp: app, crowdinApp };
}
