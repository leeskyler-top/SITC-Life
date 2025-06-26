import {createRouter, createWebHashHistory} from 'vue-router'

const public_page = {
    auth: false
}

const admin = {
    auth: true,
    is_admin: true,
    user_position: ['部长', '副部长', '部门负责人', '实习汇总负责人', '汇总负责人', '普通部员', '实习部员', '其他人员']
}

const user = {
    auth: true,
    user_position: ['部长', '副部长', '部门负责人', '实习汇总负责人', '汇总负责人', '普通部员', '实习部员', '其他人员']
}

const leader = {
    auth: true,
    user_position: ['部长', '副部长', '部门负责人']
}

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'home',
            component: () => import("@/Home.vue"),
            meta: {...public_page}
        },
        {
            path: '/user/detail',
            component: () => import("@/views/User/MyDetail.vue"),
            meta: {...user}
        },
        {
            path: '/user/manager',
            component: () => import("@/views/User/UserManager.vue"),
            meta: {...leader}
        },
        {
            path: '/user/add',
            component: () => import("@/views/User/UserAdd.vue"),
            meta: {...admin}
        },
        {
            path: '/user/batch',
            component: () => import("@/views/User/UserBatch.vue"),
            meta: {...admin}
        },
        {
            path: '/semester/manager',
            component: () => import("@/views/Semester/SemesterManager.vue"),
            meta: {...user}
        },
        {
            path: '/template/manager',
            component: () => import("@/views/Room/RoomManager.vue"),
            meta: {...user}
        },
        {
            path: '/template/batch',
            component: () => import("@/views/Room/TemplateUpload.vue"),
            meta: {...admin}
        },
        {
            path: '/schedule/manager',
            component: () => import("@/views/Schedule/ScheduleManager.vue"),
            meta: {...user}
        },
        {
            path: '/schedule/list',
            component: () => import("@/views/Schedule/ScheduleList.vue"),
            meta: {...leader}
        },
        {
            path: '/schedule/batch',
            component: () => import("@/views/Schedule/ScheduleBatch.vue"),
            meta: {...admin}
        },
        {
            path: '/checkin/list',
            component: () => import("@/views/CheckIn/CheckInList.vue"),
            meta: {...user}
        },
        {
            path: '/checkin/asl',
            component: () => import("@/views/CheckIn/ASKForLeaveManager.vue"),
            meta: {...leader}
        },
        {
            path: '/cloud/manager',
            component: () => import("@/views/Driver/DriverManager.vue"),
            meta: {...user}
        },
        {
            path: '/security/history',
            component: () => import("@/views/Security/SecurityHistory.vue"),
            meta: {...admin}
        },
        {
            path: '/analyzer/view',
            component: () => import("@/views/Analyzer/DataView.vue"),
            meta: {...leader}
        },
        {
            path: '/analyzer/transfer',
            component: () => import("@/views/Analyzer/ZipTransfer.vue"),
            meta: {...user}
        },
        {
            path: '/:pathMatch(.*)',
            component: () => import("@/views/NotFound.vue"),
            meta: {...user}
        }
    ]
})

router.beforeEach((to, from) => {
    if (to.path !== '/' && to.meta.auth && !localStorage.refresh_token) {
        return "/"
    }
    if (to.meta.is_admin && localStorage.is_admin !== 'true') {
        return from.path;
    }
    if (to.meta.auth && !to.meta?.user_position?.includes(localStorage.user_position)) {
        if (localStorage.is_admin !== 'true') {
            return from.path;
        }
    }
})
export default router
